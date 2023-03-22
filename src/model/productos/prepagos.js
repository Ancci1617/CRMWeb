
const pool = require("../connection-database");


const getPrepagoEntrega = async (calificacion, cuotas_vendido) => {


    const [cuota_entrega] = await pool.query(
        "SELECT " +
        "`Entrega` " +
        " FROM `Prepagos` " +
        "WHERE `CALIFICACION` = ? AND `CUOTASVENDIDO` = ? LIMIT 1;", [calificacion, cuotas_vendido]);
        
    if (cuota_entrega.length > 0) {
        return cuota_entrega;
    }

    return [];


}

module.exports = { getPrepagoEntrega }