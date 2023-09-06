const pool = require("../../connection-database.js");
const getClienteEnFichas = async (ficha) => {
    try {

        const [rows] = await pool.query(
            `SELECT
    CTE,
    FICHA
FROM
    Fichas
WHERE
    Fichas.FICHA = ?
UNION
SELECT
    CobranzasEC.CTE,
    CobranzasEC.Prestamo
FROM
    CobranzasEC
WHERE
    Prestamo = ?
UNION
SELECT
    VentasEC.CTE,
    VentasEC.Prestamo
FROM
    VentasEC
WHERE
    Prestamo = ? LIMIT 1;`,
            [ficha, ficha, ficha]);
        if (rows.length > 0) {
            return rows[0].CTE;
        }
        return [{
            CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES: null, CRUCES2: null, DNI: null
        }];


    } catch (error) {
        console.error("Error al consultar los datos del cliente by Ficha");
    }

}

const getCteDni = async (dni) => {

    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `DNI` = ? LIMIT 1;", [dni]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };

}
const getCteFicha = async (ficha) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `FICHA` = ? LIMIT 1;", [ficha]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteTel = async (tel) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `WHATS APP` = ? LIMIT 1;", [tel]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteCalle = async (calle) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `CALLE` = ? LIMIT 1;", [calle]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteNombre = async (nombre) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `APELLIDO Y NOMBRE` = ? LIMIT 1;", [nombre]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}
const getCteCte = async (cte) => {
    const [rows] = await pool.query(
        "SELECT `CTE`,`CALLE` FROM `Clientes` " +
        "WHERE `CTE` = ? LIMIT 1;", [cte]);
    if (rows.length > 0) {
        return rows[0];
    }
    return { CTE: -1 };
}


module.exports = { getCteDni, getCteCalle, getCteFicha, getCteNombre, getCteTel, getCteCte, getClienteEnFichas }

