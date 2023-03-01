const pool = require("../../connection-database.js");

const getMasterBGM = async (cte) => {
    const [rows] = await pool.query(
        "SELECT `Mes`,`FECHA`, `FICHA`, `Z`, `VTA`, " +
        "`Atraso`, `Anticipo`, `Cuota 1`, `Cuota 2`, `Cuota 3`, " +
        "`Cuota 4`, `Cuota 5`, `Sal Ant`, `Cuota 6`, `Sal Act`, `Cuota`, " +
        "`Cuotas`, `Valor Unitario` FROM`BaseDetalle` WHERE cte = ? "
        , [cte, cte]);
    if (rows.length > 0) {
        return rows;
    }
    return [];
}

const getMasterEC = async (cte) => {

    const [rows] = await pool.query(
        "SELECT `FECHA`, `Prestamo`, `Zona`, `Capital`, " +
        "`Ant`, `Cuota 0`, `Cuota 1`, `Cuota 2`, `Cuota 3`, `Cuota 4`, `Cuota 5`, " +
        "`Saldo Ant`, `Cuota 6`, `Saldo Act`, `Cuota`, `Cuo`, `SIT`, `COBRO` " +
        "FROM `MasterEC` WHERE cte = ?"
        , [cte]);
    if (rows.length > 0) {
        return rows;
    }
    return [];
}

const getMasterResumen = async (cte) => {

    const [rows] = await pool.query(
        "SELECT  `BGM DISPONIBLE` AS BGM, `CAPITAL`, `CALIF` FROM `MasterResumen` WHERE Cliente = ?"
        , [cte]);
    if (rows.length > 0) {
        return rows;
    }
    return [{BGM : "1", CAPITAL : "5000", CALIF : "Sin calif"}];
}


module.exports = { getMasterBGM, getMasterEC, getMasterResumen };




