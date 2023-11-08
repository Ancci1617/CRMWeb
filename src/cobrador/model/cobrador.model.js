const { getToday } = require("../../lib/dates.js");
const pool = require("../../model/connection-database.js");

const ordenarRecorrido = async ({isEasyCash = false,orders}) => {
    
    const sqlString = orders.reduce((acummulator, obj) => {
        return `${acummulator} WHEN Fichas.ID = ${obj.ID} THEN ${obj.ORDEN_COBRANZA} `
    }, "");
    const columna_ordenar = isEasyCash ? "ORDEN_EASY" : "ORDEN_COBRANZA";

    try {
        const [result] = await pool.query(`UPDATE Fichas set ${columna_ordenar} = CASE ${sqlString} ELSE ${columna_ordenar} END `, [])
        return { msg: "Recorrido cargado", success: true }
    } catch (error) {
        console.log("Error al cargar el orden del recorrido");
        console.log(error);
        return { msg: "Error al cargar el recorrido", success: false }
    }


}

const getFichasPorCobrar = async ({ filter = { "true": true },isEasyCash = false }) => {
    let keys = Object.keys(filter).reduce((accumulator, column) => { accumulator = accumulator + " AND " + column + " = ?"; return accumulator }, "")
    let keys_sql = keys.substring(5, keys.length);
    const columna_ordenar = isEasyCash ? "ORDEN_EASY" : "ORDEN_COBRANZA";

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
            (SELECT CAMBIO FROM CambiosDeFecha where CambiosDeFecha.FICHA = Fichas.FICHA order by CambiosDeFecha.ID desc limit 1) as CAMBIO_DE_FECHA,
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
            ${keys_sql} AND Fichas.ESTADO = 'ACTIVO' AND IFNULL( (SELECT CAMBIO FROM CambiosDeFecha where CambiosDeFecha.FICHA = Fichas.FICHA order by CambiosDeFecha.ID desc limit 1),TRUE) <= CURRENT_DATE  GROUP BY
            Fichas.FICHA order by ${columna_ordenar} asc;`
        , [...Object.values(filter)]);

    if (fichas.length > 0) {
        return fichas;
    }

    return [];
}


const insertCambioDeFecha = async ({ FICHA, FECHA, COBRADOR, TODAY }) => {

    try {
        const [res] = await pool.query(`INSERT INTO CambiosDeFecha (FICHA, CAMBIO, COBRADOR,FECHA,CAMBIO_ORIGINAL) VALUES (?,?,?,?,?) `, [FICHA, FECHA, COBRADOR, TODAY, FECHA]);
        console.log("respuesta insertar cambio de fecha", res);
    } catch (error) {
        console.log(error);
    }
}

const volverAlFinal = async ({ FICHA, ZONA, Usuario }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let [res] = await connection.query(
            `UPDATE Fichas set ORDEN_COBRANZA = (SELECT MAX(ORDEN_COBRANZA) + 1 from Fichas WHERE Z = (SELECT Z from Fichas where FICHA = ?)) where FICHA = ?;`, [FICHA, FICHA]);
        let [res2] = await connection.query(`
        UPDATE Fichas F left join (SELECT Fichas.FICHA,(ROW_NUMBER() OVER(ORDER BY ORDEN_COBRANZA asc)) - 1 as ORDEN from Fichas where ORDEN_COBRANZA is not null and Fichas.Z = ?) AUX on AUX.FICHA = F.FICHA SET F.ORDEN_COBRANZA = AUX.ORDEN WHERE ORDEN_COBRANZA IS NOT NULL AND Z = ? order by ORDEN_COBRANZA asc;
        `, [ZONA, ZONA])
        let [res3] = await connection.query(
            `INSERT INTO CambiosDeFecha (FICHA, CAMBIO, COBRADOR, FECHA, CODIGO_PAGO, CAMBIO_ORIGINAL) VALUES (?)`
            , [[FICHA, null, Usuario, getToday(), null, null]])


        await connection.commit();

    } catch (error) {
        console.log(error);
        await connection.rollback();

    } finally {
        await connection.release();
    }
}


module.exports = { getFichasPorCobrar, ordenarRecorrido, insertCambioDeFecha, volverAlFinal }