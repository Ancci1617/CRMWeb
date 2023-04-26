const pool = require("./connection-database.js");

const poolConfig = async () => {
    
    await pool.query("SET LOCAL lc_time_names = 'es_ES'");

}

module.exports = {poolConfig};