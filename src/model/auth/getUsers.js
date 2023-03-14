const pool = require("../connection-database");


async function getNombresDeUsuarios() {
    const [user] = await pool.query("SELECT Usuario FROM Usuarios");

    if (user.length > 0) {
        return user;
    }
    
    return { ID: -1 };

}


module.exports = { getNombresDeUsuarios}