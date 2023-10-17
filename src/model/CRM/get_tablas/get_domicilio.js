const pool = require("../../connection-database.js");

const getDomicilio = async (calle) => {

    const [rows] = await pool.query(
        `SELECT
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
        ClientesSV.CALLE = ?
    UNION
    SELECT
        MasterResumen.CALIF,
        ClientesSV.NOMBRE,
        ClientesSV.CTE,
        CobranzasEC.Prestamo,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    FROM
        ClientesSV
    LEFT JOIN MasterResumen ON MasterResumen.Cliente = ClientesSV.CTE
    INNER JOIN CobranzasEC ON CobranzasEC.CTE = ClientesSV.CTE
    WHERE
        ClientesSV.CALLE = ?;`

        , [calle, calle]);

    if (rows.length > 0) {
        return rows;
    }

    return [];

}



module.exports = { getDomicilio }


