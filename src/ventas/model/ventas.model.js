const pool = require("../../model/connection-database.js");

const getVentas = async ({ filter }) => {
    try {
        let keys = Object.keys(filter).reduce((accumulator, column) => { accumulator = accumulator + " AND " + column + " = ?"; return accumulator }, "")
        let keys_sql = keys.substring(5,keys.length);  

        const [ventas] = await pool.query(
            `SELECT
            CTE,
            FICHA,
            NOMBRE,
            ZONA,
            VentasCargadas.CALLE,
            CRUCES,
            CRUCES2,
            WHATSAPP,
            DNI,
            ARTICULOS,
            TOTAL,
            ANTICIPO,
            CUOTA,
            CUOTAS,
            TIPO,
            ESTATUS,
            PRIMER_PAGO,
            VENCIMIENTO,
            CUOTAS_PARA_ENTREGA,
            FECHA_VENTA,
            RESPONSABLE,
            APROBADO,
            USUARIO,
            MODO,
            LATITUD_VENDEDOR,
            LONGITUD_VENDEDOR,
            ACCURACY_VENDEDOR,
            VISIBLE,
            INDICE,
            UBICACIONES.LATITUD,
            UBICACIONES.LONGITUD
        FROM
            VentasCargadas
        LEFT JOIN UBICACIONES ON UBICACIONES.CALLE = VentasCargadas.CALLE
        WHERE 
        ${keys_sql} AND Visible = 1`
            , [...Object.values(filter)]);

        //REFORMAR CON ESTO
        return ventas;

    } catch (error) {
        console.error(error);
        console.log("error al momento de consultas las ventas");
    }
}


const getAsideVentas = async () => {
    try {
        const [ventas] = await pool.query("SELECT DISTINCT USUARIO,FECHA_VENTA as FECHA FROM VentasCargadas where VISIBLE = 1 order by FECHA_VENTA DESC");
        // "SELECT DISTINCT COBRADOR,FECHA FROM `PagosSV` WHERE CONFIRMACION != 'INVALIDO' ORDER BY `PagosSV`.`FECHA` DESC;";
        return ventas;


    } catch (error) {
        console.error(error);
        console.log("error al momento de consultas el ASIDE DE las ventas");
    }
}


module.exports = { getAsideVentas, getVentas }




