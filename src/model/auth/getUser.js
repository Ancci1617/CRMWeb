const pool = require("../connection-database");

async function getUsuariosWithMp() {
    try {
        const [users] = await pool.query(
    `SELECT
        ID,
        Usuario,
        RANGO,
        UNIDAD,
        PERMISOS,
        ZONAS,
        MP_TOKEN
    FROM Usuarios
    WHERE
        MP_TOKEN IS NOT NULL`);

        return users; 
    
    } catch (error) {
        console.log("error", error);
    }
}

async function getUserByPassword(username, password) {


    const [user] = await pool.query(
        "SELECT * FROM Usuarios where " +
        "Usuario = ? and Contrasenia = ? LIMIT 1"
        , [username, password]);

    if (user.length > 0) {
        return user[0];
    }
    return { ID: -1 };

}

async function getUserById(ID) {
    const [user] = await pool.query(
        "SELECT * FROM Usuarios where " +
        "ID = ? LIMIT 1"
        , [ID]);
    if (user.length > 0) {
        return user[0];
    }
    return { username: -1 };
}

async function getUserByUsuario(Usuario) {
    try {
        const [user] = await pool.query(
            "SELECT * FROM Usuarios where " +
            "Usuario = ? LIMIT 1"
            , [Usuario]);


        if (user.length > 0) {
            return user[0];
        }

    } catch (error) {
        console.log("error, no se pudo obtener un usuarios");
        console.log(error);
    }

    return { username: -1 };
}


module.exports = { getUserByPassword, getUserById, getUserByUsuario, getUsuariosWithMp }