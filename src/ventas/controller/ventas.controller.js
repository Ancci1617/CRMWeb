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


//Para admin
const cargarVentas = async (req, res) => {
    const { FECHA_VENTA, USUARIO } = req.query;
    const ventas = await ventasModel.getVentas({ filter: { FECHA_VENTA, USUARIO } });
    const aside = await getAside();
    res.render("ventas/cargar_ventas/ventas.cargar.ejs", { aside, ventas, USUARIO, FECHA: FECHA_VENTA })
}
const confirmarVenta = async (req, res) => {
    const [venta] = await ventasModel.getVentas({ filter: { INDICE: req.params.INDICE } });
    await ventasModel.confirmarVenta({ venta, ID_VENTA: venta.INDICE });
    res.redirect(req.headers.referer);
}
const borrarVenta = async (req, res) => {
    await ventasModel.borrarVenta({ ID_VENTA: req.params.INDICE });
    res.redirect(req.headers.referer);
}



//Vendeores
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
    if (ID_VENTA == "error") return res.send("Hubo un error al cargar las ventas.");
    await insertarNuevaUbicacion({ CALLE, LATITUD, LONGITUD, ID_VENTA })

    if (req.files)
        saveFileFromEntry(Object.entries(req.files), CTE);

    if (ANTICIPO > 0 && ANTICIPO_MP != "SI")
        await pagosModel.cargarPago({ CODIGO: getRandomCode(5), CTE, CUOTA: ANTICIPO, DECLARADO_CUO: ANTICIPO, FECHA: FECHA_VENTA, FICHA, OBS: "Anticipo", USUARIO, PROXIMO: PRIMER_PAGO, ID_VENTA });

    await generarContactoCTE(CTE, USUARIO, { TELEFONO }, ID_VENTA);


    res.redirect("/CRM");
}




const formEditarVenta = async (req, res) => {
    const { venta } = res.locals;
    // const [venta] = await ventasModel.getVentas({ filter: { INDICE: req.params.INDICE } });
    console.log("🚀 ~ file: ventas.controller.js:66 ~ formEditarVenta ~ venta:", venta)
    res.render("ventas/ventas.cargadas.editar.ejs", venta);
}

const postEditarVenta = async (req, res) => {
    const { CTE, ANTICIPO = 0, FECHA_VENTA, ID, FICHA, PRIMER_PAGO, ANTICIPO_MP } = req.body;
    const USUARIO = req.user.Usuario;
    const { venta: venta_prev } = res.locals;
    //Si antes no tenia anticipo y ahora si, que le genere el pago
    if (!venta_prev.ANTICIPO && ANTICIPO && ANTICIPO_MP == "NO")
        await pagosModel.cargarPago({ CODIGO: getRandomCode(5), CTE, CUOTA: ANTICIPO, DECLARADO_CUO: ANTICIPO, FECHA: FECHA_VENTA, FICHA, OBS: "Anticipo", USUARIO, PROXIMO: PRIMER_PAGO, ID_VENTA: ID });


    //Edita la venta
    await ventasModel.updateVenta(req.body);

    //Cargar imagen de frente y dorso a servidor
    if (req.files)
        saveFileFromEntry(entries, req.body.CTE);


    res.redirect(`/ventas/pasar_ventas?USUARIO=${venta_prev.USUARIO}&FECHA_VENTA=${venta_prev.FECHA_VENTA}`);
}





module.exports = { cargarVentas, formEditarVenta, formCargarVenta, postCargarVenta, postEditarVenta, borrarVenta, confirmarVenta }