const {getToday} = require("../../lib/dates.js");
const generarContactoCTEWithConection = async ({ conexion, CTE, Usuario, VENTA_ID, TELEFONO }) => {


    const [contacto_response] = await conexion.query(`INSERT INTO 
    BaseCTE(CTE, TELEFONO, LINEA, DIA, VALIDACION, GRUPO_MENSAJE, VENTA_ID) 
    VALUES (?)`, [[CTE, TELEFONO, Usuario,getToday(), 'VALIDO', 13, VENTA_ID]]);

    return contacto_response;
}



module.exports = {generarContactoCTEWithConection}