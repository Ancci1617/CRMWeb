const pool = require("../connection-database.js");

const gurdar_respuesta_crm = async (usuario,busqueda,respuesta,dia_hora) => {
    
    const [insert_response] = await pool.query(
        "Insert into RespuestasDeConsulta (Usuario,Busqueda,Respuesta,Hora) " +
        "VALUES (?,?,?,?);", [usuario,busqueda,respuesta,dia_hora]);
    
    if (insert_response.length > 0) {
        return insert_response[0];
    }
    return {};

}




module.exports = {gurdar_respuesta_crm}














