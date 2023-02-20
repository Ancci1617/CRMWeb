const pool = require("../../connection-database.js");

const getCteDni = async (dni) => {

    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `DNI` = ? LIMIT 1;", [dni]);
    if (rows.length > 0) {
        return rows[0];
    }
    return {CTE : -1};

}
const getCteFicha = async (ficha) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `FICHA` = ? LIMIT 1;", [ficha]);
    if (rows.length > 0) {
        return rows[0];
    }
    return {CTE : -1};
}
const getCteTel = async (tel) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `WHATS APP` = ? LIMIT 1;", [tel]);
    if (rows.length > 0) {
        return rows[0];
    }
    return {CTE : -1};
}
const getCteCalle = async (calle) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `CALLE` = ? LIMIT 1;", [calle]);
    if (rows.length > 0) {
        return rows[0];
    }
    return {CTE : -1};
}
const getCteNombre = async (nombre) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `APELLIDO Y NOMBRE` = ? LIMIT 1;", [nombre]);
    if (rows.length > 0) {
        return rows[0];
    }
    return {CTE : -1};
}
const getCteCte = async (cte) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `CTE` = ? LIMIT 1;", [cte]);
    if (rows.length > 0) {
        return rows[0];
    }
    return {CTE : -1};
        }


module.exports = { getCteDni, getCteCalle, getCteFicha, getCteNombre, getCteTel,getCteCte }

