const Router = require("express").Router();
const pool = require("../../../model/connection-database");
const { isLoggedIn, isNotLoggedIn, isAdmin } = require("../../../lib/auth");
const { insertVenta } = require("../../../model/ventas/insert.venta");
const { cargarStockPlanilla } = require("../../../model/mercaderia/planilla");
const { getVentasContado, getFechaDeVentasContado,deleteVentasContado } = require("../../../model/ventas/ventas.query");

Router.get("/locales", isLoggedIn, (req, res) => {
    const data = { title: "Lista de locales", items: ["BH"], links: ["/locales/BH"] };
    res.render("list-items.ejs", { data });
});

Router.get("/locales/BH", isLoggedIn, (req, res) => {
    const data = { title: "BH", items: ["Cargar venta", "Historial de venta"], links: ["/locales/BH/cargar_venta", "/locales/BH/historial"] };
    res.render("list-items.ejs", { data });
});
Router.get("/locales/:LOCAL/historial",isLoggedIn, async (req, res) => {
    const { LOCAL } = req.params;
    const fechas = await getFechaDeVentasContado();
    const items = fechas.map(fecha => fecha.FECHA);
    const links = items.map(fecha => `/locales/${LOCAL}/historial/${fecha}`);

    const data = { title: "Fechas de venta", items, links };

    res.render("list-items.ejs", { data });

});

Router.get("/locales/:LOCAL/historial/:FECHA", isLoggedIn,async (req, res) => {

    const { FECHA } = req.params;
    const ventas = await getVentasContado(FECHA);
    res.render("ventas/contado/ventas.cargadas.contado.ejs", {ventas,FECHA});

});

Router.get("/locales/:LOCAL/historial/:FECHA/eliminar_venta_contado/:INDICE",isLoggedIn,async (req,res)=> {
    const {LOCAL,INDICE,FECHA} = req.params;
    deleteVentasContado(INDICE);
    res.redirect(`/locales/${LOCAL}/historial/${FECHA}`);
});

Router.get("/locales/BH/cargar_venta", isLoggedIn, (req, res) => {
    res.render("ventas/contado/ventas.contado.cargar.ejs");
});

Router.post("/locales/:LOCAL/cargar_venta_contado", isLoggedIn, async (req, res) => {
    const { LOCAL } = req.params;
    const { DNI, NOMBRE, WHATSAPP, CALLE, ZONA, ARTICULOS, TOTAL, TIPO, FECHA_VENTA } = req.body
    const { Usuario } = req.user;
    const articulos = ARTICULOS.trim().split(" ");
    const articulos_stock = [];
    
    const venta_id = await insertVenta("0", "0", NOMBRE, ZONA, CALLE, null, null,
        WHATSAPP, DNI, ARTICULOS, TOTAL, 0, 0, 0, TIPO, null, null, null, null, FECHA_VENTA, null, "APROBADO", Usuario, 'CONTADO');

    articulos.forEach(articulo => {
        articulos_stock.push([LOCAL, 0, 0, articulo, Usuario, Usuario, "Entregado", "Cargado", "", "", 
                              FECHA_VENTA, 0, "CONTADO", -1, venta_id.insertId,""]);
    });
    cargarStockPlanilla(articulos_stock);

    res.redirect(`/locales/${LOCAL}`);

});










module.exports = Router;


