

const pool = require("../../connection-database.js");

const getPrestamos = async (cte) => {

    const [rows] = await pool.query(
        "SELECT DATE_FORMAT(`FECHA`,'%d-%b'), `Prestamo`, `Zona`, `Capital`, " +
        "`Ant`, `Mes 0`, `Mes 1`, `mes 2`, `Mes 3`, `Mes 4`, `Mes 5`, " +
        "`Saldo Ant`, `Mes 6`, `Saldo Act`, `Cuota`, `Cuo`, " +
        " DATE_FORMAT(`Fecha cobro`,'%d-%b') as `Fecha cobro`, DATE_FORMAT(`C De Fecha`,'%d-%b') as `C De Fecha`, DATE_FORMAT(`Prox Fecha`,'%d-%b') as `Prox Fecha`,  " +
        "`SERVICIOS`, `MORA`,`Deuda Cuo` FROM `VentasEC` WHERE CTE = ? " +
        "UNION " +
        "SELECT DATE_FORMAT(`FECHA`,'%d-%b-%y'), `Prestamo`, `Zona`, `Capital`, " +
        "`Ant`, `Mes 0`, `Mes 1`, `Mes 2`, `Mes 3`, `Mes 4`, `Mes 5`, " +
        "`Saldo Ant`, `Mes 6`, `Saldo Act`, `Cuota`, `Cuo`, " +
        "DATE_FORMAT(`Fecha cobro`,'%d-%b'), DATE_FORMAT(`C De Fecha`,'%d-%b') as `C De Fecha`, DATE_FORMAT(`Prox Fecha`,'%d-%b') as `Prox Fecha`, " +
        "`SERVICIOS`, `MORA`, `Deuda Cuo` FROM `CobranzasEC` WHERE CTE = ?"
        , [cte, cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [];

}

module.exports = { getPrestamos };




