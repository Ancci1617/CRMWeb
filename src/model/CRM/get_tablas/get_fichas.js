

const pool = require("../../connection-database.js");

const getFichas = async (cte) => {

    const [rows] = await pool.query(

        "SELECT DATE_FORMAT(FECHA,'%d/%m/%y'),Ficha,Z,VTA,`Anterior`,`Mes 0`,`Mes 1`,`Mes 2`,`Mes 3`,`Mes 4`,`Mes 5`, " +
        "`Sal Ant`,`Mes 6`,`Sal Act`,Cuota,`Valor Unitario`, " +
        "DATE_FORMAT(`VEN`,'%d-%b') as VEN, DATE_FORMAT(VenMovil,'%d-%b') as VenMovil,Vencidas,`Cuotas Pagas`,Totales,Atraso from Cobranzas where CTE = ? " +
        "UNION " +
        "SELECT DATE_FORMAT(`Fecha`, '%d/%m/%y'),`Ficha`,`Zona`,`Total`,null,null,null,null,null,null,null,Total,Cobrado,Saldo,Cuota,`Valor Unitario`, " +
        "DATE_FORMAT(PrimerVencimiento,'%d-%b') as PrimerVencimiento,DATE_FORMAT(`Fecha cobro`,'%d-%b') as `Fecha cobro`,Vencidas,`Cuotas Pagas`,`Cuotas`,`Atraso` FROM Ventas where CTE = ?", [cte, cte]);


        
    if (rows.length > 0) {
        return rows;
    }

    return [];

}

module.exports = {getFichas};




