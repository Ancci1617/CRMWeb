const { getToday } = require("../../lib/dates.js");
const pool = require("../../model/connection-database.js");
const generarContactoCTEWithConection = async ({ conexion, CTE, Usuario, VENTA_ID, TELEFONO }) => {


    const [contacto_response] = await conexion.query(`INSERT INTO 
    BaseCTE(CTE, TELEFONO, LINEA, DIA, VALIDACION, GRUPO_MENSAJE, VENTA_ID) 
    VALUES (?)`, [[CTE, TELEFONO, Usuario, getToday(), 'VALIDO', 13, VENTA_ID]]);

    return contacto_response;
}

const generarContactoCte = async ({ ZONA, CTE, NOMBRE, CALLE, WHATSAPP, LINEA, DIA, ID_VENTA = null }) => {
    const FECHA = getToday() || DIA
    const [response] = await pool.query(`
        INSERT INTO BaseCTE 
        (GRUPO_MENSAJE, ZONA, CTE, NOMBRE, CALLE, TELEFONO, LINEA, DIA, VENTA_ID)
        VALUES
        ((select max(GRUPO_MENSAJE) from BaseCTE b)  ,?)
    `, [[ZONA, CTE, NOMBRE, CALLE, WHATSAPP, LINEA, FECHA, ID_VENTA]])
    return response
}




module.exports = { generarContactoCTEWithConection,generarContactoCte }