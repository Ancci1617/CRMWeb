const pool = require("../connection-database");

const getDatosParaPlanilla = async (vendedor, fecha) => {
    const [result] = await pool.query(
        "Select CTE,FICHA,ANTICIPO,TOTAL,ESTATUS,ARTICULOS,USUARIO from VentasCargadas " +
        "where USUARIO = ? and FECHA_VENTA = ?", [vendedor, fecha]);

    return result;

}
const existePlanilla = async (vendedor, fecha) => {
    const [result] = await pool.query(
        "Select Count(FECHA) AS CANTIDAD from PlanillasDeCarga where " +
        "VENDEDOR = ? and FECHA = ?;", [vendedor, fecha]);

    return result[0].CANTIDAD > 0;

}

const getPlanilla = async (vendedor, fecha) => {
    const [result] = await pool.query(
        "Select PLANILLA,ARTICULOS_CONTROL,ARTICULOS_VENDEDOR from PlanillasDeCarga where " +
        "VENDEDOR = ? and FECHA = ?;", [vendedor, fecha]);

    return result[0];

}

const crearPlanilla = async (vendedor, fecha, planilla_object, control, articulos_control, articulos_vendedor) => {
    const [result] = await pool.query(
        "INSERT INTO PlanillasDeCarga (VENDEDOR,FECHA,PLANILLA,CONTROL,ARTICULOS_CONTROL,ARTICULOS_VENDEDOR) " +
        "VALUES (?,?,?,?,?,?) "
        , [vendedor, fecha, planilla_object, control, articulos_control, articulos_vendedor]);
    console.log(result);
    return result;
}

const insertPlanillaControl = async (json) => {
    const [result] = await pool.query(
        "INSERT INTO `PlanillasDeCarga`(`FECHA`,`VENDEDOR`,`ARTICULOS`) " +
        "VALUES (?,?,?) "
        , [vendedor, fecha]);

    return result;
}


const insertPlanillaVendedor = async (e) => {

}



module.exports = { getDatosParaPlanilla, insertPlanillaControl, insertPlanillaVendedor, existePlanilla, crearPlanilla, getPlanilla }



