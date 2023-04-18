const pool = require("../../connection-database");

const getCargaVigente = async (UNIDAD) => {
    const [stock] = await pool.query(
        "SELECT DISTINCT STOCK.ART,SUM(EFECTO_UNIDAD) as VIGENTE,LP.Producto AS PRODUCTO FROM `STOCK` " + 
        "left JOIN LP ON LP.Art = STOCK.ART WHERE CAMIONETA = ? " +
        "group by STOCK.ART HAVING VIGENTE != 0 ORDER BY VIGENTE desc,STOCK.ART asc; "
        , [UNIDAD]);

    return stock;
}
const getMovimientosUnidad = async (UNIDAD) => {
    const [movimientos] = await pool.query(
        "SELECT DATE_FORMAT(FECHA,'%d-%b') as FECHA,CTE,FICHA,ART,CONTROL,MOTIVO,CARGADO FROM `STOCK` " + 
        "WHERE CAMIONETA = ? and MOTIVO != 'CARGA ESTANDAR' order by FECHA"
    , [UNIDAD]);

    return movimientos;
}

const getMovimientosFiltro = async (UNIDAD,FILTRO) => {
    const [movimientos] = await pool.query(
        "SELECT DATE_FORMAT(FECHA,'%d-%b') as FECHA,CTE,FICHA,ART,CONTROL,CARGADO,MOTIVO "+
        "FROM `STOCK` WHERE CAMIONETA = ? AND MOTIVO != 'CARGA ESTANDAR' AND " + 
        "(FECHA LIKE ? OR CTE LIKE ? OR FICHA LIKE ? OR ART LIKE ? OR CONTROL LIKE ? OR MOTIVO LIKE ? OR CARGADO LIKE ?) ORDER BY FECHA"
        , [UNIDAD,`%${FILTRO}%`,`%${FILTRO}%`,`%${FILTRO}%`,`%${FILTRO}%`,`%${FILTRO}%`,`%${FILTRO}%`,`%${FILTRO}%`]);
    return movimientos;
}


module.exports = { getCargaVigente, getMovimientosUnidad ,getMovimientosFiltro}