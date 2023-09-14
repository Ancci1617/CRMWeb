const pool = require("../../model/connection-database.js");

const getVentas = async ({ filter }) => {
    try {
        let keys = Object.keys(filter).reduce((accumulator, column) => { accumulator = accumulator + " AND " + column + " = ?"; return accumulator }, "")
        let keys_sql = keys.substring(5, keys.length);

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
            UBICACIONESSV.LATITUD,
            UBICACIONESSV.LONGITUD
        FROM
            VentasCargadas
        LEFT JOIN UBICACIONESSV ON UBICACIONESSV.ID_VENTA = VentasCargadas.INDICE
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

const insertVenta = async ({ body }, { CTE, USUARIO, MODO }) => {
    const propiedadesDeVenta = ["CTE", "FICHA", "NOMBRE", "ZONA", "CALLE", "CRUCES", "CRUCES2", "WHATSAPP", "DNI", "CUOTAS", "ARTICULOS", "TOTAL", "CUOTA", "ANTICIPO", "TIPO", "ESTATUS", "PRIMER_PAGO", "VENCIMIENTO", "CUOTAS_PARA_ENTREGA", "FECHA_VENTA", "RESPONSABLE", "APROBADO", "USUARIO", "MODO", "LATITUD_VENDEDOR", "LONGITUD_VENDEDOR", "ACCURACY_VENDEDOR"];

    const objeto_venta = propiedadesDeVenta.reduce((obj, propiedad) => {
        obj[propiedad] = body[propiedad];
        return obj;
    }, {});

    const Venta = Object.assign(objeto_venta, { CTE, USUARIO, MODO })
    const [KEYS, VALUES] = [Object.keys(Venta), Object.values(Venta)];

    try {

        const [response] = await pool.query(
            `INSERT INTO VentasCargadas (??) VALUES (?);`
            , [KEYS, VALUES]);

        return response;

    } catch (error) {
        console.log(error)

    }

}


const updateVenta = async ({ CTE, FICHA, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, WHATSAPP, DNI, CUOTAS, ARTICULOS, TOTAL, CUOTA, ANTICIPO, ANTICIPO_MP, TIPO, ESTATUS, PRIMER_PAGO, VENCIMIENTO, CUOTAS_PARA_ENTREGA, FECHA_VENTA, RESPONSABLE, ubicacion_cliente, APROBADO, ID }) => {
    
    const connection = await pool.getConnection();
    const [LATITUD = null, LONGITUD = null] = ubicacion_cliente.match('-\\d+\\.\\d+,-\\d+\\.\\d+') ? ubicacion_cliente.split(',') : [];

    try {
        await connection.beginTransaction();
        const ANTICIPO_INT = parseInt(ANTICIPO || 0);

        //Actualiza la venta
        await connection.query(`UPDATE VentasCargadas SET ? WHERE INDICE = ?`, [{ CTE, FICHA, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, WHATSAPP, DNI, ARTICULOS, TOTAL, CUOTA, CUOTAS, TIPO, ESTATUS, PRIMER_PAGO, VENCIMIENTO, CUOTAS_PARA_ENTREGA, FECHA_VENTA, RESPONSABLE, APROBADO }, ID]);

        //Actualiza el contacto
        await connection.query(`UPDATE BaseCTE set TELEFONO = ? where VENTA_ID = ?;`, [WHATSAPP, ID])

        //Si antes el pago existia y ahora no existe, ademas de editarlo lo INVALIDA
        const nueva_confirmacion = !ANTICIPO_INT || ANTICIPO_MP == "SI" ? "INVALIDO" : "PENDIENTE";

        //Actualiza el pago
        await connection.query(`UPDATE PagosSV SET VALOR = ?,FICHA = ?, DECLARADO_CUO = VALOR, CONFIRMACION = ? WHERE ID_VENTA = ?;`, [ANTICIPO_INT, FICHA, nueva_confirmacion, ID]);

        await connection.query(`UPDATE UBICACIONESSV SET CALLE = ?,LATITUD = ? ,LONGITUD = ?  WHERE ID_VENTA = ?`,[CALLE,LATITUD,LONGITUD,ID]);


        
        await connection.commit()
    } catch (error) {
        console.log(error);
        await connection.rollback();
    } finally {
        connection.release();
    }


}

module.exports = { getAsideVentas, getVentas, insertVenta, updateVenta }




