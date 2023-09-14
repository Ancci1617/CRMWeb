const { saveFileFromEntry } = require("../../lib/files.js");
const { getRandomCode } = require("../../lib/random_code.js");
const { getClientesAndLocation } = require("../../model/CRM/get_tablas/get_clientes.js");
const { getNuevoNumeroDeCte } = require("../../model/ventas/ventas.query.js");
const { insertarNuevaUbicacion } = require("../../ubicaciones/model/ubicaciones.mode.js");
const ventasModel = require("../model/ventas.model.js");
const { getAside } = require("./lib/aside.js");
const fs = require("fs");
const { pagosModel } = require("../../pagos/model/pagos.model.js");
const { generarContactoCTE } = require("../../lib/contactos.js");

const cargarVentas = async (req, res) => {
    const { FECHA_VENTA, USUARIO } = req.query;
    const ventas = await ventasModel.getVentas({ filter: { FECHA_VENTA, USUARIO } });
    const aside = await getAside();
    res.render("ventas/cargar_ventas/ventas.cargar.ejs", { aside, ventas, USUARIO, FECHA: FECHA_VENTA })

}



const formCargarVenta = async (req, res) => {
    const { cte } = req.params;

    const [cte_data] = await getClientesAndLocation(cte);

    //Buscar si ya tenemos las imagenes
    const required_images = { frente: true, dorso: true, rostro: true };
    if (fs.existsSync(`../ImagenesDeClientes/${cte}`)) {
        required_images.frente = !fs.existsSync(`../ImagenesDeClientes/${cte}/CTE-${cte}-FRENTE.jpg`);
        required_images.dorso = !fs.existsSync(`../ImagenesDeClientes/${cte}/CTE-${cte}-DORSO.jpg`);
        required_images.rostro = !fs.existsSync(`../ImagenesDeClientes/${cte}/CTE-${cte}-ROSTRO.jpg`);
    }
    res.render("ventas/Ventas.cargar.ejs", { cte_data, required_images });
}


const postCargarVenta = async (req, res) => {
    const USUARIO = req.user.Usuario;
    const { ANTICIPO = 0, FECHA_VENTA, FICHA, WHATSAPP: TELEFONO, PRIMER_PAGO, ANTICIPO_MP, ubicacion_cliente, CALLE } = req.body;
    const [LATITUD = null, LONGITUD = null] = ubicacion_cliente.match('-\\d+\\.\\d+,-\\d+\\.\\d+') ? ubicacion_cliente.split(',') : [];

    //Asigna numero de cte nuevo si hace falta
    const CTE = req.body.CTE == 0 ? await getNuevoNumeroDeCte() : req.body.CTE;
    const { insertId: ID_VENTA } = await ventasModel.insertVenta({ body: req.body }, { CTE, MODO: "BGM", USUARIO });
    await insertarNuevaUbicacion({ CALLE, LATITUD, LONGITUD, ID_VENTA })

    if (req.files)
        saveFileFromEntry(Object.entries(req.files), CTE);

    if (ANTICIPO > 0 && ANTICIPO_MP != "SI")
        await pagosModel.cargarPago({ CODIGO: getRandomCode(5), CTE, CUOTA: ANTICIPO, DECLARADO_CUO: ANTICIPO, FECHA: FECHA_VENTA, FICHA, OBS: "Anticipo", USUARIO, PROXIMO: PRIMER_PAGO, ID_VENTA });

    await generarContactoCTE(CTE, USUARIO, { TELEFONO }, ID_VENTA);


    res.redirect("/CRM");
}




const formEditarVenta = async (req, res) => {
    const [venta] = await ventasModel.getVentas({ filter: { INDICE: req.params.INDICE } });
    res.render("ventas/ventas.cargadas.editar.ejs", venta);
}



const postEditarVenta = async (req, res) => {
    const { CTE, ANTICIPO = 0, FECHA_VENTA, ID, FICHA, PRIMER_PAGO, ANTICIPO_MP } = req.body;
    const USUARIO = req.user.Usuario;
    const [venta_prev] = await ventasModel.getVentas({ filter: { INDICE: ID,ID_VENTA : ID } });

    //Si antes no tenia anticipo y ahora si, que le genere el pago
    if (!venta_prev.ANTICIPO && ANTICIPO && ANTICIPO_MP == "NO") 
        await pagosModel.cargarPago({ CODIGO: getRandomCode(5), CTE, CUOTA: ANTICIPO, DECLARADO_CUO: ANTICIPO, FECHA: FECHA_VENTA, FICHA, OBS: "Anticipo", USUARIO, PROXIMO: PRIMER_PAGO, ID_VENTA: ID });
    

    //Edita la venta
    await ventasModel.updateVenta(req.body);

    //Cargar imagen de frente y dorso a servidor
    if (req.files)
        saveFileFromEntry(entries, req.body.CTE);


    res.redirect("/ventas_cargadas");
}




module.exports = { cargarVentas, formEditarVenta, formCargarVenta, postCargarVenta ,postEditarVenta}