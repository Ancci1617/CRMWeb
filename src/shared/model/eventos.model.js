const { getToday } = require("../../lib/dates.js");
const pool = require("../../model/connection-database.js");

const cargarEvento = async (conexion = pool, { USUARIO, ANTERIOR, VIGENTE, PRIMARIA, FECHA = getToday() ,TIPO}) => {


    const res = await conexion.query(`
        INSERT INTO Eventos (USUARIO, ANTERIOR, VIGENTE, PRIMARIA, FECHA,TIPO) VALUES (?)
    `, [[USUARIO, ANTERIOR, VIGENTE, PRIMARIA, FECHA,TIPO]])


}





module.exports = { cargarEvento }







