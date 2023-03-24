const pool = require("../../connection-database.js");

const getDomicilio = async (calle) => {

    const [rows] = await pool.query(
        "SELECT MasterResumen.CALIF, Clientes.`APELLIDO Y NOMBRE`,Clientes.CTE, " + 
        "Clientes.`FICHA`, Cobranzas.Atraso FROM`Clientes` left join " +
        "MasterResumen on MasterResumen.Cliente = Clientes.CTE left join " + 
        "Cobranzas on Cobranzas.Ficha = Clientes.FICHA WHERE Clientes.calle = ? order by Clientes.CTE"
        , [calle]);

    if (rows.length > 0) {
        return rows;
    }

    return [];

}



module.exports = { getDomicilio }


