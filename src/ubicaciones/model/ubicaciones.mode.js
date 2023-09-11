const pool = require("../../model/connection-database.js")


const insertarNuevaUbicacion = async ({ CALLE, LATITUD, LONGITUD, ACCURACY = 0 }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        
        //Si el domicilio no existe lo agrega
        await connection.query(
            `INSERT INTO UBICACIONES(CALLE,LATITUD,LONGITUD,ACCURACY) VALUES(?) ON DUPLICATE KEY UPDATE ?;`
            , [[CALLE, LATITUD, LONGITUD, ACCURACY], { LATITUD, LONGITUD, ACCURACY }]);

        await connection.commit();
    } catch (error) {
        console.log("Error al momento al cargar la ubicacion");
        console.error(error);
        await connection.rollback();

    } finally {
        connection.release();
    }


}





module.exports = { insertarNuevaUbicacion };