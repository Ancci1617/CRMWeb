const pool = require("../../connection-database.js");


//UNIFICAR ESTOS 2
const getClientes = async (cte) => {

    const [rows] = await pool.query(
        `SELECT
        CTE,
        ZONA,
        \`APELLIDO Y NOMBRE\` AS NOMBRE,
        CALLE,
        CRUCES,
        CRUCES2,
        IFNULL(
            (
            SELECT
                BaseCTE.TELEFONO
            FROM
                BaseCTE
            WHERE
                BaseCTE.CTE = CTE and BaseCTE.VALIDACION = "VALIDO" order by BaseCTE.ID DESC
            LIMIT 1
        ),
        \`WHATS APP\`
        ) AS WHATSAPP, DNI, MASTER, OBS
    FROM
        Clientes
    WHERE
        CTE = ?
    LIMIT 1;`, [cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [{
        CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES: null, CRUCES2: null, DNI: null
    }];

}



const getClientesFull = async (cte) => {

    const [rows] = await pool.query(
        "SELECT " +
        "`CTE`, `FICHA`,`ZONA`, `APELLIDO Y NOMBRE` as NOMBRE, " +
        "`CALLE`, `CRUCES`, `CRUCES2`," +
        "`WHATS APP` AS WHATSAPP, `DNI`, `Master`, `OBS`,`ARTICULO` FROM `Clientes` " +
        "WHERE `CTE` = ? ORDER BY FICHA DESC;", [cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [{
        CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES: null, CRUCES2: null, DNI: null
    }];

}

module.exports = { getClientes, getClientesFull }


