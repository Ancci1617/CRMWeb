const { response } = require("express");
const pool = require("../connection-database");

const insertVenta = async ({ body }, { CTE, USUARIO, MODO }) => {
    const propiedadesDeVenta = ["CTE", "FICHA", "NOMBRE", "ZONA", "CALLE", "CRUCES", "CRUCES2", "WHATSAPP", "DNI", "CUOTAS", "ARTICULOS", "TOTAL", "CUOTA", "ANTICIPO", "TIPO", "ESTATUS", "PRIMER_PAGO", "VENCIMIENTO", "CUOTAS_PARA_ENTREGA", "FECHA_VENTA", "RESPONSABLE", "APROBADO", "USUARIO", "MODO", "LATITUD_VENDEDOR", "LONGITUD_VENDEDOR", "ACCURACY_VENDEDOR"];

    const objeto_venta = propiedadesDeVenta.reduce((obj, propiedad) => {
        obj[propiedad] = body[propiedad];
        return obj;
    }, {});

    const Venta = Object.assign(objeto_venta, { CTE, USUARIO, MODO})
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

const updateVentaById = async (Venta, ANTICIPO_PREVIO) => {
    const { FICHA, ID, ANTICIPO_MP } = Venta;
    console.log("venta", Venta);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const ANTICIPO = parseInt(Venta.ANTICIPO || 0);
        const ventaSinId = { ...Venta };
        delete ventaSinId.ID;
        delete ventaSinId.ANTICIPO_MP;
        delete ventaSinId.ubicacion_cliente;

        //Actualiza la venta
        await connection.query(`UPDATE VentasCargadas SET ? WHERE INDICE = ?`, [ventaSinId, ID]);

        //Actualiza el contacto
        await connection.query(`UPDATE BaseCTE set TELEFONO = ? where VENTA_ID = ?;`, [Venta.WHATSAPP, ID])

        //Si antes el pago existia y ahora no existe, ademas de editarlo lo INVALIDA
        const nueva_confirmacion = !ANTICIPO || ANTICIPO_MP == "SI" ? "INVALIDO" : "PENDIENTE";

        //Actualiza el pago
        await connection.query(`UPDATE PagosSV SET VALOR = ?,FICHA = ?, DECLARADO_CUO = VALOR, CONFIRMACION = ? WHERE ID_VENTA = ?;`, [ANTICIPO, FICHA, nueva_confirmacion, ID]);


        await connection.commit()
    } catch (error) {
        await connection.rollback();
        console.log(error);
    } finally {
        connection.release();
    }


    return "ok";
};

const eliminarVentaById = async (ID) => {

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        //Borra el contacto
        await connection.query(`DELETE FROM BaseCTE WHERE VENTA_ID = ?`, [ID]);

        //Invalide los pagos en caso que tenga
        await connection.query(`UPDATE PagosSV SET CONFIRMACION = 'INVALIDO' WHERE ID_VENTA = ?;`, [ID]);

        //Invalida la venta
        await connection.query(`UPDATE VentasCargadas SET VISIBLE=0 WHERE INDICE = ?`, [ID]);

        const [[{ CTE }]] = await connection.query(`SELECT CTE FROM VentasCargadas where INDICE = ?`, [ID])

        await connection.commit()
        return CTE
    } catch (error) {
        await connection.rollback();
        throw new Error(error);
    } finally {
        connection.release();

    }

}

module.exports = { insertVenta, updateVentaById, eliminarVentaById }




