const fs = require("fs");
const { getClientes } = require("../model/CRM/get_tablas/get_clientes");
const { insertVenta, updateVentaById, eliminarVentaById } = require("../model/ventas/insert.venta.js")
const { getNuevoNumeroDeCte, getVentaById, borrarVentasDelDia } = require("../model/ventas/ventas.query.js")
const { saveFileFromEntry } = require("../lib/files.js");
const { generarContactoCTE } = require("../lib/contactos.js")
const { pagosModel } = require("../pagos/model/pagos.model.js");
const { getRandomCode } = require("../lib/random_code.js");
const { validarUltimoTelefonoByCte, borrarTelefonoByVentaId } = require("../model/contactos/contactos.model");
const { insertarNuevaUbicacion } = require("../ubicaciones/model/ubicaciones.mode");

const formCargarVenta = async (req, res) => {
    const { cte } = req.params;

    let [cte_data] = await getClientes(cte);

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
    const { ANTICIPO = 0, FECHA_VENTA, FICHA, WHATSAPP: TELEFONO, PRIMER_PAGO, ANTICIPO_MP ,ubicacion_cliente,CALLE} = req.body;
    const [LATITUD = null,LONGITUD = null] =  ubicacion_cliente.match('-\\d+\\.\\d+,-\\d+\\.\\d+') ? ubicacion_cliente.split(',') : [];
    
    //Asigna numero de cte nuevo si hace falta
    const CTE = req.body.CTE == 0 ? await getNuevoNumeroDeCte() : req.body.CTE;

    const propiedadesDeVenta = ["CTE", "FICHA", "NOMBRE", "ZONA", "CALLE", "CRUCES", "CRUCES2", "WHATSAPP", "DNI", "CUOTAS", "ARTICULOS", "TOTAL", "CUOTA", "ANTICIPO", "TIPO", "ESTATUS", "PRIMER_PAGO", "VENCIMIENTO", "CUOTAS_PARA_ENTREGA", "FECHA_VENTA", "RESPONSABLE", "APROBADO", "USUARIO", "MODO","LATITUD_VENDEDOR","LONGITUD_VENDEDOR","ACCURACY_VENDEDOR"];

    const { insertId } = await insertVenta({ Venta: Object.assign(objeto_venta, { CTE, USUARIO, MODO: "BGM" }) });

    await insertarNuevaUbicacion({CALLE,LATITUD,LONGITUD})


    //Cargar imagen de frente y dorso a servidor
    if (req.files)
        saveFileFromEntry(Object.entries(req.files), CTE);

    //Si tiene anticipo que el cargue el pago
    if (ANTICIPO > 0 && ANTICIPO_MP != "SI")
        await pagosModel.cargarPago({ CODIGO: getRandomCode(5), CTE, CUOTA: ANTICIPO, DECLARADO_CUO: ANTICIPO, FECHA: FECHA_VENTA, FICHA, OBS: "Anticipo", USUARIO, PROXIMO: PRIMER_PAGO, ID_VENTA: insertId });

    //Al final genera el contacto
    await generarContactoCTE(CTE, req.user.Usuario, { TELEFONO }, insertId);


    res.redirect("/CRM");
}

const getEntregaDePrepago = (req, res) => {
    const { calificacion, cuotas } = req.body;
    const { data } = require("../constants/Prepagos.js");

    const cuotas_para_entregar = data.find(obj =>
        obj.CALIFICACION == calificacion && obj.CUOTASVENDIDO == cuotas
    );

    res.json(cuotas_para_entregar || []);
}


const updateVenta = async (req, res) => {
    const { CTE, ANTICIPO = 0, FECHA_VENTA, ID, FICHA, PRIMER_PAGO, ANTICIPO_MP } = req.body;
    const USUARIO = req.user.Usuario;
    const venta_prev = await getVentaById(ID);


    //Si antes no tenia anticipo y ahora si, que le genere el pago
    if (!venta_prev.ANTICIPO && ANTICIPO && ANTICIPO_MP == "NO") {
        console.log("intenta cargar pago");
        await pagosModel.cargarPago({ CODIGO: getRandomCode(5), CTE, CUOTA: ANTICIPO, DECLARADO_CUO: ANTICIPO, FECHA: FECHA_VENTA, FICHA, OBS: "Anticipo", USUARIO, PROXIMO: PRIMER_PAGO, ID_VENTA: ID });
    }

    //Edita la venta
    await updateVentaById(req.body, venta_prev.ANTICIPO);


    //Cargar imagen de frente y dorso a servidor
    if (req.files)
        saveFileFromEntry(entries, req.body.CTE);

    res.redirect("/ventas_cargadas");


}

const eliminarVenta = async (req, res) => {

    const { indice } = req.params;
    try {
        const CTE = await eliminarVentaById(indice);
        await validarUltimoTelefonoByCte({ CTE });
    } catch (error) {
        return res.send("Hubo un error al eliminar la venta.")
    }
    res.redirect("/ventas_cargadas");

}


module.exports = { formCargarVenta, postCargarVenta, getEntregaDePrepago, updateVenta, eliminarVenta }


function estaIncluido(a, b) {
    const propiedades = Object.keys(b);

    for (let propiedad of propiedades) {
        if (a[propiedad] != b[propiedad]) {
            return false;
        }

    }
    return true;
}

