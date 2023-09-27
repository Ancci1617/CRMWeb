const pool = require("../../model/connection-database.js");

const ordenarRecorrido = async (body) => {
    const sqlString = body.reduce((acummulator, obj) => {
        return `${acummulator} WHEN FichasTest.ID = ${obj.ID} THEN ${obj.ORDEN_COBRANZA} `
    }, "");

    try {
        const [result] = await pool.query(`UPDATE FichasTest set ORDEN_COBRANZA = CASE ${sqlString} END `, [])
        return result
    } catch (error) {
        console.log("Error al cargar el orden del recorrido");
        console.log(error);
    }


}

const getFichasPorCobrar = async ({ filter = "CTE", data = "%" }) => {
    const [fichas] = await pool.query(
        `SELECT
            Fichas.FECHA AS FECHA_VENTA,
            Fichas.CTE,
            Fichas.PRIMER_PAGO,
            Fichas.FICHA,
            Fichas.Z,
            Fichas.ID,
            Fichas.VENCIMIENTO,
            Fichas.TOTAL,
            Fichas.SERVICIO_ANT,
            Fichas.ARTICULOS,
            ClientesSV.NOMBRE,
            ClientesSV.CALLE,
            ClientesSV.CRUCES,
            ClientesSV.CRUCES2,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.SERV,0)),
                0),
                INTEGER
            ) AS SERV_PAGO,
            SERV_UNIT,
            CUOTA,
            CUOTA_ANT,
            (SELECT LATITUD FROM UBICACIONESSV WHERE UBICACIONESSV.CALLE = ClientesSV.CALLE and VALIDACION = 'VALIDO' order by ID_CALLE DESC limit 1) as LATITUD,
            (SELECT LONGITUD FROM UBICACIONESSV WHERE UBICACIONESSV.CALLE = ClientesSV.CALLE and VALIDACION = 'VALIDO'  order by ID_CALLE DESC limit 1) as LONGITUD,
            Fichas.CUOTA_ANT - CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.VALOR,0)),
                0),
                INTEGER
            ) AS SALDO,
            CONVERT(
                Fichas.TOTAL / Fichas.CUOTA,
                INTEGER
            ) AS CUOTAS,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.VALOR,0)),
                0),
                INTEGER
            ) AS CUOTA_PAGO,
            Fichas.MORA_ANT,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.MORA,0)),
                0),
                INTEGER
            ) AS MORA_PAGO
        FROM
            Fichas
        LEFT JOIN PagosSV ON PagosSV.FICHA = Fichas.FICHA 
        LEFT JOIN ClientesSV on Fichas.CTE = ClientesSV.CTE 
        WHERE
            Fichas.?? LIKE ? 
        GROUP BY
            Fichas.FICHA;`
        // HAVING
        //     SALDO > 0;
        , [filter, data]);

    if (fichas.length > 0) {
        return fichas;
    }

    return [];
}







module.exports = { getFichasPorCobrar, ordenarRecorrido }