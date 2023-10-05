const pool = require("../../connection-database.js");


const getCteDni = async (dni) => {

    const [rows] = await pool.query(
        `SELECT CTE,CALLE FROM ClientesSV where ClientesSV.DNI = ? limit 1`, [dni]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };

}
const getCteFicha = async (ficha) => {
    const [rows] = await pool.query(
        `SELECT Fichas.CTE,(SELECT ClientesSV.CALLE FROM ClientesSV where ClientesSV.CTE = Fichas.CTE LIMIT 1) as CALLE from Fichas where Fichas.FICHA = ? LIMIT 1;`, [ficha]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteTel = async (tel) => {
    const [rows] = await pool.query(
        `SELECT ClientesSV.CALLE,BaseCTE.CTE FROM BaseCTE LEFT join ClientesSV on ClientesSV.CTE = BaseCTE.CTE WHERE TELEFONO = ? limit 1;`, [tel]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteCalle = async (calle) => {
    const [rows] = await pool.query(
        `SELECT CTE,CALLE from ClientesSV where CALLE = ? LIMIT 1`, [calle]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteNombre = async (nombre) => {
    const [rows] = await pool.query(
        `SELECT CTE,CALLE from ClientesSV where NOMBRE = ? LIMIT 1`, [nombre]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteCte = async (cte) => {
    const [rows] = await pool.query(
        `SELECT CTE,CALLE FROM ClientesSV where CTE = ? LIMIT 1`, [cte]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}


module.exports = { getCteDni, getCteCalle, getCteFicha, getCteNombre, getCteTel, getCteCte, getClienteEnFichas }

