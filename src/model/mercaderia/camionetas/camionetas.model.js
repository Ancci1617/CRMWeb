const pool = require("../../connection-database");

const getCargaVigente = async (UNIDAD) => {
    const [stock] = await pool.query(
        "SELECT DISTINCT STOCK.ART,SUM(EFECTO_UNIDAD) as VIGENTE,LP.Producto AS PRODUCTO,LP.CARGA_ESTANDAR FROM `STOCK` " +
        "left JOIN LP ON LP.Art = STOCK.ART WHERE CAMIONETA = ? " +
        "group by STOCK.ART HAVING VIGENTE != 0 ORDER BY STOCK.ART asc; "
        , [UNIDAD]);

    return stock;
}
const getMovimientosUnidad = async (UNIDAD) => {
    const [movimientos] = await pool.query(
        "SELECT DATE_FORMAT(FECHA,'%d-%b') as FECHA,CTE,FICHA,ART,CONTROL,MOTIVO,CARGADO,OBS FROM `STOCK` " +
        "WHERE CAMIONETA = ? and MOTIVO != 'CARGA ESTANDAR' order by FECHA"
        , [UNIDAD]);

    return movimientos;
}

const getMovimientosFiltro = async (UNIDAD, FILTRO) => {
    const [movimientos] = await pool.query(
        "SELECT DATE_FORMAT(FECHA,'%d-%b') as FECHA,CTE,FICHA,ART,CONTROL,CARGADO,MOTIVO " +
        "FROM `STOCK` WHERE CAMIONETA = ? AND MOTIVO != 'CARGA ESTANDAR' AND " +
        "(FECHA LIKE ? OR CTE LIKE ? OR FICHA LIKE ? OR ART LIKE ? OR CONTROL LIKE ? OR MOTIVO LIKE ? OR CARGADO LIKE ?) ORDER BY FECHA"
        , [UNIDAD, `%${FILTRO}%`, `%${FILTRO}%`, `%${FILTRO}%`, `%${FILTRO}%`, `%${FILTRO}%`, `%${FILTRO}%`, `%${FILTRO}%`]);
    return movimientos;
}


const insertarControlDeUnidades = async (insercion) => {
    const [almacen] = await pool.query(
        "INSERT INTO AlmacenDeControles (UNIDAD,RESPONSABLE,ART,VIGENTE,CONTROL,DIFERENCIA,FECHA,HORA) values ?"
        , [insercion])

    return almacen;
}
const getControlesHistorial = async (UNIDAD,FECHAHORA) => {
    const [almacen] = await pool.query(
        "SELECT DISTINCT RESPONSABLE,ART,VIGENTE,CONTROL,DIFERENCIA FROM AlmacenDeControles WHERE CONCAT(FECHA,' ',HORA) = ? " + 
        "AND UNIDAD = ? ORDER BY DIFERENCIA DESC,ART ;"
        , [FECHAHORA,UNIDAD])

    return almacen;
}
const getFechasHistorialControles = async (UNIDAD) => {
    const [fechas] = await pool.query(
        "SELECT DISTINCT CONCAT(FECHA, ' ' , HORA) AS FECHA FROM AlmacenDeControles WHERE UNIDAD = ? order by FECHA DESC;",[UNIDAD])

    return fechas;
}

module.exports = { getCargaVigente, getMovimientosUnidad, getMovimientosFiltro,insertarControlDeUnidades,getControlesHistorial ,getFechasHistorialControles}