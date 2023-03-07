

const pool = require("../../connection-database.js");

const getFichas = async (cte) => {

    const [rows] = await pool.query(
        "SELECT FECHA,Ficha,Z,VTA,`Anterior`,`Mes 0`,`Mes 1`,`Mes 2`,`Mes 3`,`Mes 4`,`Mes 5`, " +
        "`Sal Ant`,`Mes 6`,`Sal Act`,Cuota,`Valor Unitario`, " +
        "DATE_FORMAT(`VEN`,'%d/%m') as VEN, DATE_FORMAT(VenMovil,'%d/%m') as VenMovil,Vencidas,`Cuotas Pagas`,Totales,Atraso from Cobranzas where CTE = ? " +
        "UNION " +
        "SELECT `Fecha`,`Ficha`,`Zona`,`Total`,0,0,0,0,0,0,0,Total,Cobrado,Saldo,Cuota,`Valor Unitario`, " +
        "DATE_FORMAT(PrimerVencimiento,'%d/%m') as PrimerVencimiento,DATE_FORMAT(`Fecha cobro`,'%d/%m') as `Fecha cobro`,Vencidas,`Cuotas Pagas`,`Cuotas`,`Atraso` FROM Ventas where CTE = ?", [cte, cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [];

}

module.exports = {getFichas};




