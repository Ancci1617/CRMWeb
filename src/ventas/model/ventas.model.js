const pool = require("../../model/connection-database.js");

const getVentas = async ({ filter }) => {
    try {
        let keys = Object.keys(filter).reduce((accumulator, column) => { accumulator = accumulator + " AND " + column + " = ?"; return accumulator }, "")
        let keys_sql = keys.substring(5, keys.length);

        const [ventas] = await pool.query(
            `SELECT
            VentasCargadas.CTE,
            VentasCargadas.FICHA,
            NOMBRE,
            ZONA,
            VentasCargadas.CALLE,
            Fichas.ESTADO, 
            CRUCES,
            CRUCES2,
            WHATSAPP,
            DNI,
            Fichas.ARTICULOS,
            Fichas.TOTAL,
            ANTICIPO,
            Fichas.CUOTA,
            CUOTAS,
            TIPO,
            ESTATUS,
            Fichas.PRIMER_PAGO,
            Fichas.VENCIMIENTO as VENCIMIENTO,
            Day(Fichas.VENCIMIENTO) as DIA_VENCIMIENTO,
            CUOTAS_PARA_ENTREGA,
            Fichas.SERV_UNIT,
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
            UBICACIONESSV.LONGITUD,
            Fichas.VENCIMIENTO as PRIMER_VENCIMIENTO
        FROM
            VentasCargadas
        LEFT JOIN UBICACIONESSV ON UBICACIONESSV.ID_VENTA = VentasCargadas.INDICE
		LEFT JOIN Fichas ON Fichas.ID_VENTA = VentasCargadas.INDICE
        WHERE 
        ${keys_sql} AND Visible = 1`
            , [...Object.values(filter)]);

        //REFORMAR CON ESTO
        return ventas;

    } catch (error) {
        console.error(error);
        console.log("error al momento de consultas las ventas");
        // return []
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
    const { NOMBRE, CALLE, CRUCES, CRUCES2, FICHA, ZONA, ARTICULOS, TOTAL, CUOTA, PRIMER_PAGO, FECHA_VENTA, SERV_UNIT, PRIMER_VENCIMIENTO, DNI } = body;

    const objeto_venta = propiedadesDeVenta.reduce((obj, propiedad) => {
        obj[propiedad] = body[propiedad];
        return obj;
    }, {});

    const Venta = Object.assign(objeto_venta, { CTE, USUARIO, MODO })
    const [KEYS, VALUES] = [Object.keys(Venta), Object.values(Venta)];


    const connection = await pool.getConnection()
    try {
        const [response] = await connection.query(
            `INSERT INTO VentasCargadas (??) VALUES (?);`
            , [KEYS, VALUES]);


        await connection.query(
            `INSERT INTO Fichas(
            FECHA,
            CTE,
            FICHA,
            Z,
            TOTAL,
            CUOTA,
            VENCIMIENTO,
            PRIMER_PAGO,
            CUOTA_ANT,
            SERV_UNIT,
            ARTICULOS,
            ID_VENTA,
            ESTADO
        )
        VALUES(?)`, [[FECHA_VENTA, CTE, FICHA, ZONA, TOTAL, CUOTA, PRIMER_VENCIMIENTO, PRIMER_PAGO, TOTAL, SERV_UNIT, ARTICULOS, response.insertId, "PENDIENTE"]]);

        await connection.query(`INSERT IGNORE INTO  ClientesSV(CTE, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, DNI) VALUES (?)`, [[CTE, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, DNI]])

        await connection.commit()

        return response;
    } catch (error) {
        console.log(error);
        await connection.rollback();
    } finally {
        connection.release();
    }
    return { insertId: "error" }
}
const insertPrestamo = async ({ body }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [res] = await connection.query(``);
        
        
        await connection.commit();



    } catch (error) {



        await connection.rollback();
    } finally {
        connection.release();
    }


}

const updateVenta = async ({ CTE, FICHA, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, WHATSAPP, DNI, CUOTAS, ARTICULOS, TOTAL, CUOTA, ANTICIPO, ANTICIPO_MP, TIPO, ESTATUS, PRIMER_PAGO, VENCIMIENTO, CUOTAS_PARA_ENTREGA, FECHA_VENTA, RESPONSABLE, ubicacion_cliente, APROBADO, ID, PRIMER_VENCIMIENTO, SERV_UNIT }) => {

    const connection = await pool.getConnection();
    const [LATITUD = null, LONGITUD = null] = ubicacion_cliente.match('-\\d+\\.\\d+,-\\d+\\.\\d+') ? ubicacion_cliente.split(',') : [];

    try {
        await connection.beginTransaction();
        const ANTICIPO_INT = parseInt(ANTICIPO || 0);

        //Actualiza la venta
        await connection.query(`UPDATE VentasCargadas SET ? WHERE INDICE = ?`, [{ CTE, FICHA, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, WHATSAPP, DNI, ARTICULOS, TOTAL, CUOTA, CUOTAS, TIPO, ESTATUS, PRIMER_PAGO, VENCIMIENTO, CUOTAS_PARA_ENTREGA, FECHA_VENTA, RESPONSABLE, APROBADO, ANTICIPO }, ID]);

        //Actualiza el contacto
        await connection.query(`UPDATE BaseCTE set TELEFONO = ? where VENTA_ID = ?;`, [WHATSAPP, ID])

        //Si antes el pago existia y ahora no existe, ademas de editarlo lo INVALIDA
        const nueva_confirmacion = !ANTICIPO_INT || ANTICIPO_MP == "SI" ? "INVALIDO" : "PENDIENTE";

        //Actualiza el pago
        await connection.query(`UPDATE PagosSV SET VALOR = ?,FICHA = ?, DECLARADO_CUO = VALOR, CONFIRMACION = ? WHERE ID_VENTA = ?;`, [ANTICIPO_INT, FICHA, nueva_confirmacion, ID]);

        await connection.query(`UPDATE UBICACIONESSV SET CALLE = ?,LATITUD = ? ,LONGITUD = ?  WHERE ID_VENTA = ?`, [CALLE, LATITUD, LONGITUD, ID]);

        await connection.query(`UPDATE Fichas SET ? where ID_VENTA = ?`, [{ FECHA: FECHA_VENTA, CTE, FICHA, Z: ZONA, TOTAL, CUOTA, VENCIMIENTO: PRIMER_VENCIMIENTO, PRIMER_PAGO, TOTAL, SERV_UNIT, ARTICULOS, ESTADO: "PENDIENTE" }, ID]);

        await connection.commit()
    } catch (error) {
        console.log(error);
        await connection.rollback();
    } finally {
        connection.release();
    }


}

const borrarVenta = async ({ ID_VENTA }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        //Fichas
        await connection.query(`DELETE FROM Fichas where ID_VENTA = ?`, [ID_VENTA]);

        //Contactos
        await connection.query(`DELETE FROM BaseCTE where VENTA_ID = ?`, [ID_VENTA]);

        //Ubicaciones 
        await connection.query(`UPDATE UBICACIONESSV set VALIDACION = 'INVALIDO' where ID_VENTA = ?`, [ID_VENTA]);

        //Pagos
        await connection.query(`UPDATE PagosSV SET CONFIRMACION='INVALIDO' WHERE ID_VENTA = ? `, [ID_VENTA]);

        //VentasCargadas
        await connection.query(`UPDATE VentasCargadas SET Visible = 0 where INDICE = ?`, [ID_VENTA]);

        await connection.commit()
    } catch (error) {
        console.log(error);
        await connection.rollback();
    } finally {
        connection.release();
    }
}
const confirmarVenta = async ({ venta }) => {
    const { CTE, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, DNI } = venta;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(`UPDATE Fichas SET ESTADO = 'ACTIVO' where ID_VENTA = ?`, [venta.INDICE]);
        await connection.query(`UPDATE ClientesSV set ? WHERE CTE = ?`, [{ NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, DNI }, CTE])

        await connection.commit()
    } catch (error) {
        console.log(error);
        await connection.rollback();
    } finally {
        connection.release();
    }
}

module.exports = { getAsideVentas, getVentas, insertVenta, updateVenta, borrarVenta, confirmarVenta }




