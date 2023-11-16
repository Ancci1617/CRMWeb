const pool = require("../../model/connection-database")


const getListadoDeNumerosDeClientes = async () => {
    
    try {
        const [response] = await pool.query(`SELECT CTE from ClientesSV order by CTE ASC`);
        return response;
    } catch (error) {
        console.log("ERROR AL CONSULTAR LISTADO DE NUMEROS DE CLIENTE",error)   
    }
    

}

module.exports = {getListadoDeNumerosDeClientes}







