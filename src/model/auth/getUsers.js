const pool = require("../connection-database");


async function getNombresDeUsuarios() {
    const [user] = await pool.query("SELECT Usuario FROM Usuarios");

    if (user.length > 0) {
        return user;
    }
    
    return { ID: -1 };

}
async function getNombresDeUsuariosByRango(RANGO,EXCEPTO = [""]) {

    const [user] = await pool.query("SELECT Usuario FROM Usuarios where RANGO IN (?) and Usuario NOT IN (?)",[RANGO,EXCEPTO]);

    if (user.length > 0) {
        return user;
    }
    
    return { ID: -1 };

}

async function getUnidades() {
    const [unidades] = await pool.query('SELECT DISTINCT UNIDAD FROM `Usuarios` WHERE UNIDAD != ""');
    
    if (unidades.length > 0) {
        return unidades;
    }
    
    return { unidades: -1 };

}


module.exports = { getNombresDeUsuarios,getUnidades,getNombresDeUsuariosByRango}