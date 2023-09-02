const fs = require("fs");
const { getClientes } = require("../model/CRM/get_tablas/get_clientes");
const {insertVenta} = require("../model/ventas/insert.venta.js")
const {getNuevoNumeroDeCte} = require("../model/ventas/ventas.query.js")
const { saveFileFromEntry } = require("../lib/files.js");
const {generarContactoCTE} = require("../lib/contactos.js")

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
    //Inicializa variables

    const { Usuario } = req.user;
    const { FICHA, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, WHATSAPP, DNI,
        CUOTAS, ARTICULOS, TOTAL, CUOTA, ANTICIPO, TIPO, ESTATUS, PRIMER_PAGO,
        VENCIMIENTO, CUOTAS_PARA_ENTREGA, FECHA_VENTA, RESPONSABLE, APROBADO } = req.body;

    //Asigna numero de cte nuevo
    const CTE = req.body.CTE == 0 ? await getNuevoNumeroDeCte() : req.body.CTE;

    //Carga la venta
    const insert_response = await insertVenta(CTE, FICHA, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, WHATSAPP, DNI,
        ARTICULOS, TOTAL, ANTICIPO, CUOTA, CUOTAS, TIPO, ESTATUS, PRIMER_PAGO,
        VENCIMIENTO, CUOTAS_PARA_ENTREGA, FECHA_VENTA, RESPONSABLE, APROBADO, Usuario, "BGM");


    //Cargar imagen de frente y dorso a servidor
    if (req.files) {
        const entries = Object.entries(req.files);
        saveFileFromEntry(entries, CTE);
    }

    await generarContactoCTE(CTE, Usuario, { TELEFONO: WHATSAPP }, insert_response.insertId);

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


module.exports = { formCargarVenta, postCargarVenta, getEntregaDePrepago }
