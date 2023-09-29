const pool = require("../../model/connection-database.js");

const ordenarRecorrido = async (body) => {
    const sqlString = body.reduce((acummulator, obj) => {
        return `${acummulator} WHEN FichasTest.ID = ${obj.ID} THEN ${obj.ORDEN_COBRANZA} `
    }, "");

    try {
        const [result] = await pool.query(`UPDATE FichasTest set ORDEN_COBRANZA = CASE ${sqlString} ELSE ORDEN_COBRANZA END `, [])
        return { msg: "Recorrido cargado", success: true }
    } catch (error) {
        console.log("Error al cargar el orden del recorrido");
        console.log(error);
        return { msg: "Error al cargar el recorrido", success: false }
    }


}

const getFichasPorCobrar = async ({ filter = { "true": true } }) => {
    let keys = Object.keys(filter).reduce((accumulator, column) => { accumulator = accumulator + " AND " + column + " = ?"; return accumulator }, "")
    let keys_sql = keys.substring(5, keys.length);


    const [fichas] = await pool.query(
        `SELECT
            FichasTest.FECHA AS FECHA_VENTA,
            FichasTest.CTE,
            FichasTest.PRIMER_PAGO,
            FichasTest.FICHA,
            FichasTest.Z,
            FichasTest.ID,
            FichasTest.VENCIMIENTO,
            FichasTest.TOTAL,
            FichasTest.SERVICIO_ANT,
            FichasTest.ARTICULOS,
            ClientesSV.NOMBRE,
            ClientesSV.CALLE,
            ClientesSV.CRUCES,
            ClientesSV.CRUCES2,
            (SELECT CAMBIO FROM CambiosDeFecha where CambiosDeFecha.FICHA = FichasTest.FICHA order by CambiosDeFecha.ID desc limit 1) as CAMBIO_DE_FECHA,
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
            FichasTest.CUOTA_ANT - CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.VALOR,0)),
                0),
                INTEGER
            ) AS SALDO,
            CONVERT(
                FichasTest.TOTAL / FichasTest.CUOTA,
                INTEGER
            ) AS CUOTAS,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.VALOR,0)),
                0),
                INTEGER
            ) AS CUOTA_PAGO,
            FichasTest.MORA_ANT,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.MORA,0)),
                0),
                INTEGER
            ) AS MORA_PAGO
        FROM
            FichasTest
        LEFT JOIN PagosSV ON PagosSV.FICHA = FichasTest.FICHA 
        LEFT JOIN ClientesSV on FichasTest.CTE = ClientesSV.CTE 
        WHERE
            ${keys_sql} AND IFNULL( (SELECT CAMBIO FROM CambiosDeFecha where CambiosDeFecha.FICHA = FichasTest.FICHA order by CambiosDeFecha.ID desc limit 1),TRUE) <= CURRENT_DATE
        GROUP BY
            FichasTest.FICHA order by ORDEN_COBRANZA asc;`
        , [...Object.values(filter)]);

    if (fichas.length > 0) {
        return fichas;
    }

    return [];
}


const insertCambioDeFecha = async ({ FICHA, FECHA, COBRADOR }) => {

    try {
        const [res] = await pool.query(`INSERT INTO CambiosDeFecha (FICHA, CAMBIO, COBRADOR) VALUES (?,?,?) `, [FICHA, FECHA, COBRADOR]);
        console.log("respuesta insertar cambio de fecha", res);
    } catch (error) {
        console.log(error);
    }
}

const volverAlFinal = async ({ FICHA ,ZONA}) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let [res] = await connection.query(
            `UPDATE FichasTest set ORDEN_COBRANZA = (SELECT MAX(ORDEN_COBRANZA) + 1 from FichasTest WHERE Z = (SELECT Z from FichasTest where FICHA = ?)) where FICHA = ?;`, [FICHA, FICHA]);
        let [res2] = await connection.query(`
        UPDATE FichasTest F left join (SELECT FichasTest.FICHA,(ROW_NUMBER() OVER(ORDER BY ORDEN_COBRANZA asc)) - 1 as ORDEN from FichasTest where ORDEN_COBRANZA is not null and FichasTest.Z = ?) AUX on AUX.FICHA = F.FICHA SET F.ORDEN_COBRANZA = AUX.ORDEN WHERE ORDEN_COBRANZA IS NOT NULL AND Z = ? order by ORDEN_COBRANZA asc;
        `,[ZONA,ZONA])
        console.log({res,res2});



        await connection.commit();

    } catch (error) {
        console.log(error);
        await connection.rollback();

    } finally {
        await connection.release();
    }
}


module.exports = { getFichasPorCobrar, ordenarRecorrido, insertCambioDeFecha, volverAlFinal }