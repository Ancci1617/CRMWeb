const pool = require("../../connection-database");

const getCargaVigente = async (UNIDAD) => {
    const [stock] = await pool.query(
        "SELECT DISTINCT STOCK.ART,SUM(EFECTO_UNIDAD) as VIGENTE,LP.Producto AS PRODUCTO FROM `STOCK` " + 
        "left JOIN LP ON LP.Art = STOCK.ART WHERE CAMIONETA = ? " +
        "group by STOCK.ART HAVING VIGENTE != 0 ORDER BY VIGENTE desc,STOCK.ART asc; "
        , [UNIDAD]);

    return stock;
}


module.exports = { getCargaVigente }