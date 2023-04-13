const pool = require("../connection-database");


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
    return { username : -1 };
}

async function getUserByUsuario(Usuario) {
    const [user] = await pool.query(
        "SELECT * FROM Usuarios where " +
        "Usuario = ? LIMIT 1"
        , [Usuario]);
    if (user.length > 0) {
        return user[0];
    }
    return { username : -1 };
}


module.exports = { getUserByPassword , getUserById ,getUserByUsuario}