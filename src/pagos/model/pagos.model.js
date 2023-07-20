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
            "CONVERT(IFNULL(SUM(PagosSV.SERV),0),INTEGER) as SERV_PAGO, SERV_UNIT,OBS,CUOTA,CUOTA_ANT," +
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
        CONFIRMACION = "PENDIENTE", USUARIO, FECHA, CODIGO ,OBS}) {

        const [ficha_data] = await pool.query(
            "INSERT INTO `PagosSV` " +
            "(`CTE`, `FICHA`, `VALOR`, `PROXIMO`, `MP`, `SERV`, `MORA`, `COBRADOR`, `FECHA`, `CONFIRMACION`,`CODIGO`,`OBS`) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
            , [CTE, FICHA, CUOTA, PROXIMO, MP, SERV, MORA, USUARIO, FECHA, CONFIRMACION, CODIGO,OBS]);

        return ficha_data;

    }

    async getFichasByCte(CTE = "%") {
        const [fichas] = await pool.query(
            "SELECT Fichas.FECHA AS FECHA_VENTA,Fichas.CTE,Fichas.FICHA,Fichas.VENCIMIENTO,Fichas.TOTAL,Fichas.SERVICIO_ANT," +
            "Fichas.ARTICULOS ,CONVERT(IFNULL(SUM(PagosSV.SERV),0),INTEGER) as SERV_PAGO, SERV_UNIT,CUOTA,CUOTA_ANT," +
            "Fichas.CUOTA_ANT - CONVERT(IFNULL(sum(PagosSV.VALOR),0),INTEGER) as SALDO, CONVERT(Fichas.TOTAL / Fichas.CUOTA,INTEGER) as CUOTAS, " +
            "CONVERT(IFNULL(SUM(PagosSV.VALOR),0),INTEGER) as CUOTA_PAGO,Fichas.MORA_ANT, CONVERT(IFNULL(sum(PagosSV.MORA),0),INTEGER) as MORA_PAGO FROM `Fichas` " +
            "left join PagosSV on PagosSV.FICHA = Fichas.FICHA where Fichas.CTE like ? GROUP BY Fichas.FICHA;"
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
        //SELECT MONTH(PagosSVAcumulado.FECHA) as MES,sum(VALOR) as CUOTA, CONVERT(IFNULL(sum(MORA),0),INTEGER) as MORA, CONVERT(IFNULL(sum(SERV),0),INTEGER) as SERV from PagosSVAcumulado where CONCAT(CTE,'-',FICHA) = CONCAT(9218,'-',6889) group by MES UNION SELECT MONTH(CURRENT_DATE) as MES, sum(PagosSV.VALOR) as CUOTA, CONVERT(IFNULL(sum(PagosSV.MORA),0),INTEGER) as MORA, CONVERT(IFNULL(sum(PagosSV.SERV),0),INTEGER) as SERV from PagosSV where CONCAT(PagosSV.CTE,'-',PagosSV.FICHA) = CONCAT(9218,'-',6889) group by MES;
        const [pago_data] = await pool.query(
            "SELECT MONTH(PagosSVAcumulado.FECHA) as MES,sum(VALOR) as CUOTA, "+
            "CONVERT(IFNULL(sum(MORA),0),INTEGER) as MORA, CONVERT(IFNULL(sum(SERV),0),INTEGER) as SERV "+
            "from PagosSVAcumulado where CONCAT(CTE,'-',FICHA) = CONCAT(?,'-',?) group by MES " + 
            "UNION " + 
            "SELECT MONTH(CURRENT_DATE) as MES, sum(PagosSV.VALOR) as CUOTA, "+
            "CONVERT(IFNULL(sum(PagosSV.MORA),0),INTEGER) as MORA, " +
            "CONVERT(IFNULL(sum(PagosSV.SERV),0),INTEGER) as SERV " +
            "from PagosSV where CONCAT(PagosSV.CTE,'-',PagosSV.FICHA) = CONCAT(?,'-',?) group by MES;"
            , [CTE, FICHA,CTE,FICHA])

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

    async getPagosByFechaYCob({ COB = "%", FECHA = "%" }) {

        const [PAGOS] = await pool.query(
            "SELECT PagosSV.`CTE`, PagosSV.`FICHA`,Fichas.Z, `VALOR` AS CUOTA, `PROXIMO`, " +
            "PagosSV.`OBS` , `MP`, `SERV`, `MORA`, `COBRADOR`, PagosSV.`FECHA`, `CONFIRMACION`, `CODIGO`, " +
            "PagosSV.`ID`, Fichas.CUOTA_ANT - (SELECT SUM(PagosSV.VALOR) FROM PagosSV " +
            "Where PagosSV.FICHA = Fichas.FICHA) as SALDO, PagosSV.SERV + PagosSV.MORA as CUOTA_SERV, Clientes.CALLE,Clientes.`APELLIDO Y NOMBRE` AS NOMBRE " +
            "FROM `PagosSV` left join Fichas on Fichas.FICHA = PagosSV.FICHA left join Clientes on Clientes.CTE = PagosSV.CTE where PagosSV.FECHA " +
            "like ? and PagosSV.COBRADOR like ? group by ID order by CONFIRMACION,Z,PagosSV.FICHA; "
            , [FECHA, COB]);

        if (PAGOS.length > 0) {
            return PAGOS;
        }
        return [];
    }

    async updateDistribucionByCodigo({ PROXIMO, SERV, MORA, CUOTA, CODIGO }) {
        const [update_result] = await pool.query(
            "UPDATE PagosSV SET PROXIMO = ?, SERV = ? , MORA = ?, VALOR = ? WHERE CODIGO = ? ", [PROXIMO, SERV, MORA, CUOTA, CODIGO]);

        if (update_result.length > 0) {
            return update_result;
        }
        return [];
    }
    async updateEstadoPagoByCodigo({ CODIGO, ESTADO }) {
        const [update_result] = await pool.query(
            "UPDATE PagosSV SET CONFIRMACION = ? WHERE CODIGO = ? ", [ESTADO, CODIGO]);

        if (update_result.length > 0) {
            return update_result;
        }
        return [];
    }

    async getFichas() {
        const [FICHAS] = await pool.query(
            "SELECT `FECHA`, `CTE`, `FICHA`, `Z`, `TOTAL`, `CUOTA`, " +
            "`VENCIMIENTO`, `CUOTA_ANT`, `SERVICIO_ANT`, `MORA_ANT`, `SERV_UNIT`, " +
            "`ARTICULOS`, `ID` FROM `Fichas` ");

        if (FICHAS.length > 0) {
            return FICHAS;
        }
        return [];

    }

    async updateMoraYServicioAntBase() {
        const [update_result] = await pool.query(
            "UPDATE PagosSV SET CONFIRMACION = ? WHERE CODIGO = ? ", [ESTADO, CODIGO]);

        if (update_result.length > 0) {
            return update_result;
        }
        return [];
    }

    //Recibe un array de numeros de fichas
    async updateSaldosAnterioresYServicios(FICHAS) {
        try {
            const [update_result] = await pool.query(
                "UPDATE Fichas JOIN ( " +
                "SELECT PagosSV.FICHA as ficha_sub_consulta,SUM(PagosSV.SERV) AS suma_valores " +
                "FROM PagosSV GROUP BY PagosSV.FICHA " +
                ") AS subconsulta ON Fichas.FICHA = subconsulta.ficha_sub_consulta " +
                "SET Fichas.SERVICIO_ANT = subconsulta.suma_valores where Fichas.FICHA in (?);",[FICHAS]);
            return update_result;

        } catch (err) {
            console.error("ERROR AL CARGAR SALDOS ANTERIORES", err);
        }
    }


}



module.exports = { pagosModel: new PagosModel() }