const pool = require("../../connection-database.js");

const getDomicilio = async (calle) => {

    const [rows] = await pool.query(
    `SELECT DISTINCT
        MasterResumen.CALIF,
        ClientesSV.NOMBRE,
        ClientesSV.CTE,
        Fichas.FICHA,
        Fichas.TOTAL,
        Fichas.VENCIMIENTO,
        Fichas.PRIMER_PAGO,
        Fichas.CUOTA,
        CONVERT(
            Fichas.TOTAL / Fichas.CUOTA,
            INTEGER
        ) AS CUOTAS,
        Fichas.CUOTA_ANT - IFNULL(
            (
            SELECT
                SUM(PagosSV.VALOR)
            FROM
                PagosSV
            WHERE
                PagosSV.FICHA = Fichas.FICHA AND PagosSV.CONFIRMACION != 'VALIDACION'
        ),
        0
        ) AS SALDO
    FROM
        ClientesSV
    LEFT JOIN MasterResumen ON MasterResumen.Cliente = ClientesSV.CTE
    LEFT JOIN Fichas ON Fichas.CTE = ClientesSV.CTE
    WHERE
        ClientesSV.CALLE = ?;`

        , [calle]);

    if (rows.length > 0) {
        return rows;
    }

    return [];

}



module.exports = { getDomicilio }


