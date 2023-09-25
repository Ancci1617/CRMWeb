const pool = require("../../model/connection-database.js");

const ordenarRecorrido = () => {

}


const getFichasPorCobrar = async ({COBRADOR = "*"}) => {
    try {
        const [fichas] = await pool.query("SELECT * from Fichas ");

        return fichas
    } catch (error) {
        console.log("Error al GET Fichas por cobrar");
        console.log(error);
    }
} 










