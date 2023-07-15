const pool = require("../../model/connection-database")


class PagosModel {

    async getPagoByCodigo(CODIGO) {
        const [ficha_data] = await pool.query(
            "SELECT * FROM `PagosSV` WHERE CODIGO = ?;"
            , [CODIGO]);

        if (ficha_data.length > 0) {
            return ficha_data[0];
        }
        return [];
    }

    async getFicha(FICHA) {

        const [ficha_data] = await pool.query(
            "SELECT Fichas.CTE,Fichas.FICHA,Fichas.VENCIMIENTO,Fichas.TOTAL,Fichas.SERVICIO_ANT," +
            "CONVERT(IFNULL(SUM(PagosSV.SERV),0),INTEGER) as SERV_PAGO, SERV_UNIT,CUOTA,CUOTA_ANT," +
            "Fichas.CUOTA_ANT - CONVERT(IFNULL(sum(PagosSV.VALOR),0),INTEGER) as SALDO, CONVERT(Fichas.TOTAL / Fichas.CUOTA,INTEGER) as CUOTAS, " +
            "CONVERT(IFNULL(SUM(PagosSV.VALOR),0),INTEGER) as CUOTA_PAGO,Fichas.MORA_ANT, CONVERT(IFNULL(sum(PagosSV.MORA),0),INTEGER) as MORA_PAGO FROM `Fichas` " +
            "left join PagosSV on PagosSV.FICHA = Fichas.FICHA where Fichas.FICHA = ? ;"
            , [FICHA]);

        if (ficha_data.length > 0) {

            return ficha_data[0];
        }

        return [];

    }
    async cargarPago({ CTE, FICHA, CUOTA, PROXIMO, MP = "EFECTIVO", SERV = 0, MORA = 0,
        CONFIRMACION = "PENDIENTE", USUARIO, FECHA, CODIGO }) {

        const [ficha_data] = await pool.query(
            "INSERT INTO `PagosSV` " +
            "(`CTE`, `FICHA`, `VALOR`, `PROXIMO`, `MP`, `SERV`, `MORA`, `COBRADOR`, `FECHA`, `CONFIRMACION`,`CODIGO`) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?)"
            , [CTE, FICHA, CUOTA, PROXIMO, MP, SERV, MORA, USUARIO, FECHA, CONFIRMACION, CODIGO]);

        return ficha_data;

    }

    async getFichasByCte(CTE) {
        const [fichas] = await pool.query(
            "SELECT Fichas.FECHA AS FECHA_VENTA,Fichas.CTE,Fichas.FICHA,Fichas.VENCIMIENTO,Fichas.TOTAL,Fichas.SERVICIO_ANT," +
            "Fichas.ARTICULOS ,CONVERT(IFNULL(SUM(PagosSV.SERV),0),INTEGER) as SERV_PAGO, SERV_UNIT,CUOTA,CUOTA_ANT," +
            "Fichas.CUOTA_ANT - CONVERT(IFNULL(sum(PagosSV.VALOR),0),INTEGER) as SALDO, CONVERT(Fichas.TOTAL / Fichas.CUOTA,INTEGER) as CUOTAS, " +
            "CONVERT(IFNULL(SUM(PagosSV.VALOR),0),INTEGER) as CUOTA_PAGO,Fichas.MORA_ANT, CONVERT(IFNULL(sum(PagosSV.MORA),0),INTEGER) as MORA_PAGO FROM `Fichas` " +
            "left join PagosSV on PagosSV.FICHA = Fichas.FICHA where Fichas.CTE = ? GROUP BY Fichas.FICHA;"
            , [CTE]);

        if (fichas.length > 0) {

            return fichas;
        }

        return [];
    }

    async insertCambioDeFecha({ CTE, FICHA, FECHA_COB, COBRADOR, FECHA }) {
        const [response] = await pool.query(
            "INSERT INTO `PagosSV` (`CTE`, `FICHA`, `PROXIMO`, `COBRADOR`, `FECHA`) " +
            "VALUES " +
            "(?,?,?,?,?)", [CTE, FICHA, FECHA_COB, COBRADOR, FECHA])

        return response;
    }
    async getAcumuladoByCteFicha({ CTE, FICHA }) {

        const [pago_data] = await pool.query(
            "SELECT IFNULL(MONTH(PagosSVAcumulado.FECHA),0) as MES,sum(VALOR) as CUOTA, " +
            "CONVERT(IFNULL(sum(MORA),0),INTEGER) as MORA, CONVERT(IFNULL(sum(SERV),0),INTEGER) as SERV " +
            "from PagosSVAcumulado where CONCAT(CTE,'-',FICHA) = CONCAT(?,'-',?) group by MES;"
            , [CTE, FICHA])

        if (pago_data.length > 0) {
            return pago_data;
        }

        return [];

    }



    async getFechasDePagosYCobradores() {

        const [FECHAS] = await pool.query(
            "SELECT DISTINCT COBRADOR,FECHA FROM `PagosSV` ORDER BY `PagosSV`.`FECHA` DESC;");


        if (FECHAS.length > 0) {
            return FECHAS;
        }

        return [];

    }

    async getPagosByFechaYCob({ COB, FECHA }) {

        const [PAGOS] = await pool.query(
            "SELECT PagosSV.`CTE`, PagosSV.`FICHA`, `VALOR` AS CUOTA, `PROXIMO`, `MP`, `SERV`, `MORA`, `COBRADOR`, " +
            "PagosSV.`FECHA`, `CONFIRMACION`, `CODIGO`, `ID`, Fichas.CUOTA_ANT - SUM(PagosSV.VALOR) as SALDO, " +
            "PagosSV.SERV + PagosSV.MORA as CUOTA_SERV FROM `PagosSV` left join Fichas on Fichas.FICHA = PagosSV.FICHA " +
            "where PagosSV.FECHA = ? and PagosSV.COBRADOR = ? group by FICHA;", [FECHA, COB]);


        if (PAGOS.length > 0) {
            return PAGOS;
        }
        return [];
    }

    async updateServicioByCodigo({ PROXIMO, SERV, MORA, CUOTA, CODIGO }) {
        const [update_result] = await pool.query(
            "UPDATE PagosSV SET PROXIMO = ?, SERV = ? , MORA = ?, VALOR = ? WHERE CODIGO = ? ", [PROXIMO, SERV, MORA, CUOTA, CODIGO]);

        if (update_result.length > 0) {
            return update_result;
        }
        return [];
    }

}



module.exports = { pagosModel: new PagosModel() }