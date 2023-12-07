const { getToday } = require("../../lib/dates.js");

const cargarEvento = async (conexion, { USUARIO, ANTERIOR, VIGENTE, PRIMARIA, FECHA = getToday() }) => {


    const res = await conexion.query(`
        INSERT INTO Eventos (USUARIO, ANTERIOR, VIGENTE, PRIMARIA, TIEMPO, FECHA) VALUES (?)
    `, [USUARIO, ANTERIOR, VIGENTE, PRIMARIA, FECHA,])
    console.log("Insercion de evento ", res);

    
}





module.exports = { cargarEvento }







