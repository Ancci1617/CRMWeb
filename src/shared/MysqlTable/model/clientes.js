const pool = require("../../../model/connection-database")



const getListadoDeClientes = async () => {
    const [listaDeClientes] = await pool.query(`SELECT CTE from Fichas union select CTE from BaseDetalle`)
    return listaDeClientes.map(data => data.CTE)
}





module.exports = {getListadoDeClientes}