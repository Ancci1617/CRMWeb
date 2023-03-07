

const pool = require("../../connection-database.js");

const getPrestamos = async (cte) => {

    const [rows] = await pool.query(
        "SELECT `FECHA`, `Prestamo`, `Zona`, `Capital`, " +
        "`Ant`, `Mes 0`, `Mes 1`, `mes 2`, `Mes 3`, `Mes 4`, `Mes 5`, " +
        "`Saldo Ant`, `Mes 6`, `Saldo Act`, `Cuota`, `Cuo`, " +
        " DATE_FORMAT(`Fecha cobro`,'%d/%m') as `Fecha cobro`, DATE_FORMAT(`C De Fecha`,'%d/%m') as `C De Fecha`, DATE_FORMAT(`Prox Fecha`,'%d/%m') as `Prox Fecha`,  " +
        "`SERVICIOS`, `MORA`,`Deuda Cuo` FROM `VentasEC` WHERE CTE = ? " +
        "UNION " +
        "SELECT `FECHA`, `Prestamo`, `Zona`, `Capital`, " +
        "`Ant`, `Mes 0`, `Mes 1`, `Mes 2`, `Mes 3`, `Mes 4`, `Mes 5`, " +
        "`Saldo Ant`, `Mes 6`, `Saldo Act`, `Cuota`, `Cuo`, " +
        "DATE_FORMAT(`Fecha cobro`,'%d/%m'), DATE_FORMAT(`C De Fecha`,'%d/%m') as `C De Fecha`, DATE_FORMAT(`Prox Fecha`,'%d/%m') as `Prox Fecha`, " +
        "`SERVICIOS`, `MORA`, `Deuda Cuo` FROM `CobranzasEC` WHERE CTE = ?"
        , [cte, cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [];

}

module.exports = { getPrestamos };




