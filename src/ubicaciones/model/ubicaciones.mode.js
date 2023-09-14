const pool = require("../../model/connection-database.js")


const insertarNuevaUbicacion = async ({ CALLE, LATITUD, LONGITUD, ID_VENTA = null }) => {
    try {

        //Si el domicilio no existe lo agrega
        const [insert_result] = await pool.query(
            `INSERT INTO UBICACIONESSV (CALLE,LATITUD,LONGITUD,ID_VENTA) VALUES (?);`
            , [[CALLE, LATITUD, LONGITUD, ID_VENTA]]);

        return insert_result

    } catch (error) {
        console.log("Error al momento al cargar la ubicacion");
        console.error(error);
    }
}





module.exports = { insertarNuevaUbicacion };