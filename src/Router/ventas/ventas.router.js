const Router = require("express").Router();
const pool = require("../../model/connection-database");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes");
const { getPrepagoEntrega } = require("../../model/productos/prepagos");
const { insertVenta, updateVentaById } = require("../../model/ventas/insert.venta");
const { getPrecio } = require("../../lib/get_precio");
const { isLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const { getVentaById, getVentasDelDia, getNuevoNumeroDeCte, borrarVentasDelDia, getVentasVendedores, getVendedores, getFechaDeVentas, getVentasDelDiaGeneral } = require("../../model/ventas/ventas.query");
const { saveFileFromEntry } = require("../../lib/files");
const { generarContactoCTE } = require("../../lib/contactos");
const { validarUltimoTelefonoByCte, borrarTelefonoByVentaId,updateContactoDeVenta } = require("../../model/contactos/contactos.model");


Router.get("/cargar_venta/:cte", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const { cte } = req.params;


    //Si el cliente no existe envia una matriz vacia
    //"Teoricamente no es posible evaluar un cliente que no exista"
    let cte_data = await getClientes(cte);
    cte_data[0].username = req.user.Usuario;

    res.render("ventas/Ventas.cargar.ejs", cte_data[0]);

});

Router.get("/cargar_venta", isLoggedIn, async (req, res) => {
    res.redirect("/cargar_venta/0");
});

Router.post("/cargar_venta", isLoggedIn, async (req, res) => {
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
});

Router.post("/query_prepago_entrega", isLoggedIn, async (req, res) => {

    const { calificacion, cuotas } = req.body;

    const cuotas_para_entregar = await getPrepagoEntrega(calificacion.trim(), cuotas);
    res.json(cuotas_para_entregar[0]);

});

Router.post("/query_precio", isLoggedIn, async (req, res) => {

    const data = req.body;
    console.log("BODY DEL PRECIO", req.body);
    const query_result = { total: 0, cuota: 0 };

    for (let i = 0; i < data.articulos.length; i++) {

        let respuesta = await getPrecio(data.articulos[i], data.cuotas);

        if (respuesta.PRECIO == "no encontrado") {
            query_result.total = "articulo " + data.articulos[i] + " no encontrado";
            query_result.cuota = "articulo " + data.articulos[i] + " no encontrado";
            break;
        }


        query_result.total += respuesta.PRECIO ? respuesta.PRECIO : 0;

    }

    if (typeof query_result.total !== "string") {
        query_result.cuota = query_result.total / data.cuotas;
    }


    res.json(query_result);

});

Router.get("/ventas_cargadas", isLoggedIn, async (req, res) => {

    const today = new Date();
    const date = today.getFullYear() + "-" + (today.getMonth() + 1).toString().padStart(2, "0") + "-" + today.getDate().toString().padStart(2, "0");
    const ventas = await getVentasDelDia(date, req.user.Usuario);

    res.render("ventas/Ventas.cargadas.ejs", { ventas });
});

Router.get("/ventas_cargadas/editar/:ID", isLoggedIn, async (req, res) => {
    const { ID } = req.params;
    const venta = await getVentaById(ID);
    res.render("ventas/ventas.cargadas.editar.ejs", venta);

});


Router.post("/ventas_cargadas/editar", isLoggedIn, async (req, res) => {
    const { CTE,ID,WHATSAPP } = req.body;

    //Carga la venta
    await updateVentaById(req.body);
    await updateContactoDeVenta(ID,WHATSAPP);


    //Cargar imagen de frente y dorso a servidor
    if (req.files) {
        const entries = Object.entries(req.files);
        saveFileFromEntry(entries, CTE);
    }

    res.redirect("/ventas_cargadas");


});

Router.get("/eliminar_venta/:indice", isLoggedIn, async (req, res) => {

    const { indice } = req.params;
    const venta = await getVentaById(indice);
    await borrarTelefonoByVentaId({ ID: indice });
    await borrarVentasDelDia(indice, req.user.Usuario);
    await validarUltimoTelefonoByCte({ CTE: venta.CTE });
    res.redirect("/ventas_cargadas");

});

Router.get("/ventas_cargadas_vendedores", isLoggedIn, isAdmin, async (req, res) => {

    const vendedores = await getVendedores();
    const fechas = await getFechaDeVentas();

    res.render("ventas/Ventas.cargadas.vendedores.ejs", { vendedores, fechas });

})

Router.post("/ventas_cargadas_vendedores", isLoggedIn, isAdmin, async (req, res) => {

    //{VENDEDOR : 'DIEGO' , FECHA : '2023-03-04' ,  }
    let ventas;
    let total = 0;

    if (req.body.VENDEDOR == "General") {
        ventas = await getVentasDelDiaGeneral(req.body.FECHA);
    } else {
        ventas = await getVentasVendedores(req.body.VENDEDOR, req.body.FECHA);
    }

    //Suma de totales
    ventas.forEach(venta => {
        total += parseFloat(venta.TOTAL.replaceAll(".", "").replaceAll(",", ""));
    })

    //Agrega el resumen 
    ventas = {
        VENTAS: ventas,
        RESUMEN: {
            FICHAS: ventas.length,
            TOTAL: total
        }
    }

    res.json(ventas);

})


module.exports = Router;


