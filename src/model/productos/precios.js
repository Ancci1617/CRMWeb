const pool = require("../connection-database");


const getPrecioCuotas3 = async (articulo) => {
    
    const [precio] = await pool.query(
        "SELECT " +
        "`CUOTAS_3` AS PRECIO" +
        " FROM `LP` " +
        "WHERE `Art` = ? LIMIT 1;", [articulo]);
    if (precio.length > 0) {
        return precio[0];
    }
    return {PRECIO: "no encontrado"};

}

const getPrecioCuotas6 = async (articulo) => {
    
    const [precio] = await pool.query(
        "SELECT " +
        "`CUOTAS_6` AS PRECIO" +
        " FROM `LP` " +
        "WHERE `Art` = ? LIMIT 1;", [articulo]);
    if (precio.length > 0) {
        return precio[0];
    }
    return {PRECIO: "no encontrado"};
    
}

const getPrecioCuotas9 = async (articulo) => {
    
    const [precio] = await pool.query(
        "SELECT " +
        "`CUOTAS_9` AS PRECIO" +
        " FROM `LP` " +
        "WHERE `Art` = ? LIMIT 1;", [articulo]);
    if (precio.length > 0) {
        return precio[0];
    }
    return {PRECIO: "no encontrado"};
    
}

const getPrecioCuotas12 = async (articulo) => {
    
    const [precio] = await pool.query(
        "SELECT " +
        "`CUOTAS_12` AS PRECIO" +
        " FROM `LP` " +
        "WHERE `Art` = ? LIMIT 1;", [articulo]);
    if (precio.length > 0) {
        return precio[0];
    }
    return {PRECIO: "no encontrado"};
    
}

const getPrecioCuotasContado = async (articulo) => {
    
    const [precio] = await pool.query(
        "SELECT " +
        "`CONTADO` AS PRECIO" +
        " FROM `LP` " +
        "WHERE `Art` = ? LIMIT 1;", [articulo]);
    if (precio.length > 0) {
        return precio[0];
    }
    return {PRECIO: "no encontrado"};
    
}




module.exports = { getPrecioCuotasContado,getPrecioCuotas3,getPrecioCuotas6,getPrecioCuotas9,getPrecioCuotas12 }







