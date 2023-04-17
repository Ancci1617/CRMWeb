const pool = require("../connection-database");

const getFechasPlanillasHabilitadas = async (vendedor) => {
    const [fechas] = await pool.query(
        "Select DISTINCT FECHA from PlanillasDeCarga where VENDEDOR = ? ORDER BY FECHA",
        [vendedor]);

    return fechas;
}


const existePlanilla = async (vendedor, fecha) => {
    const [result] = await pool.query(
        "Select Count(FECHA) AS CANTIDAD from PlanillasDeCarga where " +
        "VENDEDOR = ? and FECHA = ?;", [vendedor, fecha]);

    return result[0].CANTIDAD > 0;

}

const getPlanillaCarga = async (vendedor, fecha) => {
    const [result] = await pool.query(
        "Select PLANILLA,ARTICULOS_CONTROL,ARTICULOS_VENDEDOR,CONTROL,VENDEDOR,FECHA,isEditableVendedor,isEditableControl,TIPO,SOBRECARGA,UNIDAD from PlanillasDeCarga where " +
        "VENDEDOR = ? and FECHA = ?;", [vendedor, fecha]);

    if (result.length > 0) {
        return result[0];
    }

    return;

}

const crearPlanilla = async (vendedor, fecha, planilla_object, control, articulos_control, articulos_vendedor, sobrecarga,unidad) => {
    const [result] = await pool.query(
        "INSERT INTO PlanillasDeCarga (VENDEDOR,FECHA,PLANILLA,CONTROL,ARTICULOS_CONTROL,ARTICULOS_VENDEDOR,SOBRECARGA,UNIDAD) " +
        "VALUES (?,?,?,?,?,?,?,?) "
        , [vendedor, fecha, planilla_object, control, articulos_control, articulos_vendedor, sobrecarga,unidad]);


    return result;
}




const insertarArticulos = async (fecha, vendedor, articulos, RANGO) => {   
    
    //Si es admin o vendedor, lo inserta en un lugar distinto
    query = `UPDATE PlanillasDeCarga SET ` +
            `${RANGO == "VENDEDOR" ? "ARTICULOS_VENDEDOR" : "ARTICULOS_CONTROL"} = ? ` +
            `WHERE FECHA = ? and VENDEDOR = ?`;

    await pool.query(query, [articulos, fecha, vendedor]);

}
const cerrarPlanillaVendedor = async (fecha, vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET `isEditableVendedor`='0' where VENDEDOR = ? and FECHA = ?"
        , [vendedor, fecha]);

    return result;
}
const cerrarPlanilla = async (fecha, vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET `isEditableVendedor`='0',`isEditableControl` = '0'  where VENDEDOR = ? and FECHA = ?"
        , [vendedor, fecha]);
    return result;
}


const habilitarVendedor = async (fecha, vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET `isEditableVendedor`='1'  where VENDEDOR = ? and FECHA = ?"
        , [vendedor, fecha]);

    return result;
}


const borrarPlanilla = async (fecha, vendedor, planilla) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` set PLANILLA = ?, CONTROL = null where VENDEDOR = ? and FECHA = ?"
        , [planilla, vendedor, fecha]);

    return result;
}

const insertSobreCarga = async (json, fecha, vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET SOBRECARGA = ? " +
        "WHERE VENDEDOR = ? AND FECHA = ? "
        , [json, vendedor, fecha]);

    return result;
}

const insertarBaseArticulos = async (fecha, vendedor, planilla, control, articulos_control, articulos_vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET CONTROL = ?, PLANILLA = ? ,ARTICULOS_CONTROL = ?,ARTICULOS_VENDEDOR = ? " +
        "WHERE VENDEDOR = ? AND FECHA = ? "
        , [control, planilla, articulos_control, articulos_vendedor, vendedor, fecha]);

    return result;
}

const cargarStockPlanilla = async (articulos) => {

    query = "INSERT INTO `STOCK` (`CAMIONETA`, `CTE`, `FICHA`, " + 
        "`ART`, `VENDEDOR`, `CONTROL`, `ESTADO`, `CARGADO`, " + 
        "`ARTICULOS_CONTROL`, `ARTICULOS_VENDEDOR`, `FECHA`, `EFECTO`,`MOTIVO`,`EFECTO_UNIDAD`) VALUES ? "
    

    await pool.query(query, [articulos]);

}


module.exports = {
    
    existePlanilla, crearPlanilla,
    getPlanillaCarga, getFechasPlanillasHabilitadas, insertarArticulos,
    cerrarPlanillaVendedor, cerrarPlanilla, habilitarVendedor, borrarPlanilla,
    insertSobreCarga, insertarBaseArticulos, cargarStockPlanilla
}



