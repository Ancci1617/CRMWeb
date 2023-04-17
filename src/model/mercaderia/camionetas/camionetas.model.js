const pool = require("../../connection-database");

const getCargaVigente = async (UNIDAD) => {
    const [stock] = await pool.query(
        "SELECT DISTINCT ART, SUM(EFECTO_UNIDAD) as VIGENTE FROM `STOCK` WHERE CAMIONETA = ? group by ART; "
        , [UNIDAD]);

    return stock;
}


module.exports = { getCargaVigente }