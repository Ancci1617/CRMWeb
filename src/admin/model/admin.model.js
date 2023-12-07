const pool = require("../../model/connection-database")
const { generarContactoCTEWithConection } = require("../../contactos/model/contactos.model.js");
const { getClientesAndLocation } = require("../../model/CRM/get_tablas/get_clientes.js");
const { insertarNuevaUbicacionWithConection } = require("../../ubicaciones/model/ubicaciones.mode.js");
const { cargarEvento } = require("../../shared/model/eventos.modeL.js");

const updateClientesSV = async (CTE, { NOMBRE, CALLE, ZONA, CRUCES, CRUCES2, WHATSAPP, DNI, UBICACION, Usuario, LATITUD, LONGITUD }) => {

    const conexion = await pool.getConnection();
    try {

        const [clientePrev] = await getClientesAndLocation(CTE);

        //Cliente
        const [clienteRes] = await conexion.query(`UPDATE ClientesSV set ? WHERE CTE = ?`, [{ NOMBRE, CALLE, ZONA, CRUCES, CRUCES2, DNI }, CTE]);
        const [resFichas] = await conexion.query(`UPDATE Fichas set Z = ? where CTE = ?`, [ZONA, CTE]);


        //contacto
        if (clientePrev.WHATSAPP != WHATSAPP)
            await generarContactoCTEWithConection({ conexion, CTE, Usuario, VENTA_ID: null, TELEFONO: WHATSAPP });

        //ubicacion
        if (LATITUD != clientePrev.LATITUD || LONGITUD != clientePrev.LONGITUD)
            await insertarNuevaUbicacionWithConection({ CALLE, LATITUD, LONGITUD, conexion });


    } catch (error) {
        await conexion.rollback();

        console.log(error);
        throw new Error(error)

    } finally {
        conexion.release();
    }


}


const cargarDevolucion = async (ficha, USUARIO) => {
    const conexion = await pool.getConnection();

    try {

        const [res] = await conexion.query(`
            UPDATE Fichas set ESTADO = 'DEVOLUCION' where Fichas.FICHA = ?
        `, [ficha]);

        await cargarEvento(conexion, {
            USUARIO, ANTERIOR: JSON.stringify({ ESTADO: "ACTIVO" }),
            VIGENTE: JSON.stringify({ ESTADO: "DEVOLUCION" }),
            PRIMARIA: ficha,
            TIPO: "DEVOLUCION"
        });


        return res

    } catch (error) {
        await conexion.rollback();

        console.log(error)

        throw new Error(error)

    } finally {
        conexion.release();
    }


}


const updateFichasSV = async (FICHA, body, USUARIO) => {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [ficha_data_prev] = await conexion.query(`
            Select * from Fichas where Fichas.FICHA = ?;
        `, [FICHA])

        const [res] = await conexion.query(`
            UPDATE Fichas set ? where Fichas.FICHA = ?;
        `, [body, FICHA]);



        await cargarEvento(conexion, {
            ANTERIOR: JSON.stringify(ficha_data_prev[0]),
            VIGENTE: JSON.stringify(body),
            PRIMARIA: FICHA,
            TIPO: "ACTUALIZA_FICHA",
            USUARIO
        })
        await conexion.commit();
        return res

    } catch (error) {
        await conexion.rollback();

        console.log(error)

        throw new Error(error)

    } finally {
        conexion.release();
    }


}

module.exports = { updateClientesSV, cargarDevolucion, updateFichasSV }