const pool = require("../../model/connection-database")


class PagosModel {

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
            "SELECT Fichas.CTE,Fichas.FICHA,Fichas.VENCIMIENTO,Fichas.TOTAL,Fichas.SERVICIO_ANT," +
            "CONVERT(IFNULL(SUM(PagosSV.SERV),0),INTEGER) as SERV_PAGO, SERV_UNIT,CUOTA,CUOTA_ANT," +
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

}



module.exports = { pagosModel: new PagosModel() }