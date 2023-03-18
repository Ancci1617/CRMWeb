const pool = require("../connection-database");

const getFechasPlanillasHabilitadas = async (vendedor) => {
    const [fechas] = await pool.query(
        "Select DISTINCT FECHA from PlanillasDeCarga where VENDEDOR = ?",
        [vendedor]);

    return fechas;
}

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
        "Select PLANILLA,ARTICULOS_CONTROL,ARTICULOS_VENDEDOR,CONTROL,VENDEDOR,FECHA,isEditableVendedor,isEditableControl,TIPO,SOBRECARGA from PlanillasDeCarga where " +
        "VENDEDOR = ? and FECHA = ?;", [vendedor, fecha]);

    return result[0];

}

const crearPlanilla = async (vendedor, fecha, planilla_object, control, articulos_control, articulos_vendedor,sobrecarga) => {
    const [result] = await pool.query(
        "INSERT INTO PlanillasDeCarga (VENDEDOR,FECHA,PLANILLA,CONTROL,ARTICULOS_CONTROL,ARTICULOS_VENDEDOR,SOBRECARGA) " +
        "VALUES (?,?,?,?,?,?,?) "
        , [vendedor, fecha, planilla_object, control, articulos_control, articulos_vendedor,sobrecarga]);


    return result;
}
const crearPlanillaParcial = async (vendedor, fecha,sobrecarga) => {
    const [result] = await pool.query(
        "INSERT INTO PlanillasDeCarga (VENDEDOR,FECHA,SOBRECARGA) " +
        "VALUES (?,?,?) "
        , [vendedor, fecha,sobrecarga]);


    return result;
}

const insertPlanillaControl = async (json) => {
    const [result] = await pool.query(
        "INSERT INTO `PlanillasDeCarga`(`FECHA`,`VENDEDOR`,`ARTICULOS`) " +
        "VALUES (?,?,?) "
        , [vendedor, fecha]);

    return result;
}


const insertarArticulos = async (fecha, vendedor, articulos, dato) => {
    let query = "";
    
    if (dato == "VENDEDOR") {
        console.log("PERMISOS vendedor");
        query = "UPDATE `PlanillasDeCarga` SET `ARTICULOS_VENDEDOR`= ?  WHERE FECHA = ? and VENDEDOR = ?";
    } else if (dato == "ADMIN") {
        console.log("PERMISOS admin");
        query = "UPDATE `PlanillasDeCarga` SET `ARTICULOS_CONTROL`= ?  WHERE FECHA = ? and VENDEDOR = ?";
    } else {
        console.log("PERMISOS NO DISPONIBLES");
        return "PERMISOS NO DISPONIBLES";
    }


    const [result] = await pool.query(query, [articulos, fecha , vendedor]);
    return result;
}

const cerrarPlanillaVendedor = async (fecha,vendedor)  => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET `isEditableVendedor`='0' where VENDEDOR = ? and FECHA = ?"
        , [vendedor, fecha]);

    return result;
}
const cerrarPlanilla = async (fecha,vendedor)  => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET `isEditableVendedor`='0',`isEditableControl` = '0'  where VENDEDOR = ? and FECHA = ?"
        , [vendedor, fecha]);

    return result;
}


const habilitarVendedor = async (fecha,vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET `isEditableVendedor`='1'  where VENDEDOR = ? and FECHA = ?"
        , [vendedor, fecha]);

    return result;
}
const borrarPlanilla = async (fecha,vendedor,planilla) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` set PLANILLA = ?, CONTROL = null where VENDEDOR = ? and FECHA = ?"
        , [planilla,vendedor, fecha]);

    return result;
}

const insertSobreCarga = async (json,fecha,vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET SOBRECARGA = ? " +
        "WHERE VENDEDOR = ? AND FECHA = ? "
        , [json,vendedor, fecha]);

    return result;
}

const insertarBaseArticulos = async (fecha,vendedor,planilla,control,articulos_control,articulos_vendedor) => {
    const [result] = await pool.query(
        "UPDATE `PlanillasDeCarga` SET CONTROL = ?, PLANILLA = ? ,ARTICULOS_CONTROL = ?,ARTICULOS_VENDEDOR = ? " +
        "WHERE VENDEDOR = ? AND FECHA = ? "
        , [control,planilla,articulos_control,articulos_vendedor,vendedor, fecha]);

    return result;
}


module.exports = {
    getDatosParaPlanilla, insertPlanillaControl,
     existePlanilla, crearPlanilla,
    getPlanilla, getFechasPlanillasHabilitadas, insertarArticulos,
    cerrarPlanillaVendedor,cerrarPlanilla,habilitarVendedor,borrarPlanilla,
    insertSobreCarga,crearPlanillaParcial,insertarBaseArticulos
}



