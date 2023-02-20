

const pool = require("../../connection-database.js");

const getPrestamos = async (cte) => {

    const [rows] = await pool.query(
        "SELECT `FECHA`, `Prestamo`, `Zona`, `Capital`, " +
        "`Ant`, `AGO`, `SEP`, `OCT`, `NOV`, `DIC`, `ENE`, " +
        "`Saldo Ant`, `FEB`, `Saldo Act`, `Cuota`, `Cuo`, " +
        " `Fecha cobro`, `C De Fecha`, `Prox Fecha`,  " +
        "`SERVICIOS`, `MORA`,`Deuda Cuo` FROM `VentasEC` WHERE CTE = ? " +
        "UNION " +
        "SELECT `FECHA`, `Prestamo`, `Zona`, `Capital`, " +
        "`Ant`, `AGO`, `SEP`, `OCT`, `NOV`, `DIC`, `ENE`, " +
        "`Saldo Ant`, `FEB`, `Saldo Act`, `Cuota`, `Cuo`, " +
        "`Fecha cobro`, `C De Fecha`, `Prox Fecha`, " +
        "`SERVICIOS`, `MORA`, `Deuda Cuo` FROM `CobranzasEC` WHERE CTE = ?"
        , [cte, cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [];

}

module.exports = { getPrestamos };




