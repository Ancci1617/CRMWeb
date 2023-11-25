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

const insertarNuevaUbicacionWithConection = async ({ conexion, CALLE, LATITUD, LONGITUD, ID_VENTA = null }) => {
    const [res] = await conexion.query(`
    INSERT INTO UBICACIONESSV (CALLE,LATITUD,LONGITUD,ID_VENTA) VALUES (?);
    `, [[CALLE, LATITUD, LONGITUD, ID_VENTA]])
    return res
}

//data = {}
const getUbicacionByObject = async (data) => {
    const [res] = await pool.query(`
        SELECT
            UbicacionesSV.CALLE,UbicacionesSV.LATITUD,UbicacionesSV.LONGITUD,UbicacionesSV.ID_CALLE,UbicacionesSV.ID_VENTA
        FROM
            UbicacionesSV
        INNER JOIN(
            SELECT
            CALLE as C,
            MAX(ID_CALLE) AS maximo 
            FROM
                UbicacionesSV
            GROUP BY
                CALLE
        ) base_id
    ON
        base_id.maximo = UbicacionesSV.ID_CALLE
    WHERE ?
    `, [data]);
    return res;
}


module.exports = { insertarNuevaUbicacion, insertarNuevaUbicacionWithConection, getUbicacionByObject };