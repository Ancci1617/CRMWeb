const pool = require("../../connection-database.js");

const getClientes = async (cte) => {
    
    await pool.query("SET lc_time_names = 'es_ES'");
    
    const [rows] = await pool.query(
        "SELECT " +
        "`CTE`, `ZONA`, `APELLIDO Y NOMBRE` as NOMBRE, " +
        "`CALLE`, `CRUCES`, `CRUCES2`," +
        "`WHATS APP` AS WHATSAPP, `DNI`, `Master`, `OBS` FROM `Clientes` " +
        "WHERE `CTE` = ? LIMIT 1;", [cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [{
        CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES : null, CRUCES2:null, DNI: null
    }];

}

module.exports = { getClientes }


