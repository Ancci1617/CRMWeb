const Router = require("express").Router();
const pool = require("../../../model/connection-database");
const { isLoggedIn, isNotLoggedIn, isAdmin } = require("../../../lib/auth");
const { insertVenta } = require("../../../model/ventas/insert.venta");

Router.get("/locales", isLoggedIn, (req, res) => {
    const data = { title: "Lista de locales", items: ["BH"], links: ["/locales/BH"] };
    res.render("list-items.ejs", { data });
});

Router.get("/locales/BH", isLoggedIn, (req, res) => {
    const data = { title: "BH", items: ["Cargar venta", "Historial de venta"], links: ["/locales/BH/cargar_venta", "/locales/BH/historial"] };
    res.render("list-items.ejs", { data });
});

Router.get("/locales/BH/cargar_venta", isLoggedIn, (req, res) => {



    res.render("ventas/contado/ventas.contado.cargar.ejs");

});

Router.post("/locales/cargar_venta_contado", isLoggedIn, isAdmin, async (req, res) => {
    const { DNI, NOMBRE, WHATSAPP, CALLE, ZONA, ARTICULOS, TOTAL, TIPO, FECHA_VENTA } = req.body
    const { Usuario } = req.user;

    await insertVenta("0", "0", NOMBRE, ZONA, CALLE, null, null,
        WHATSAPP, DNI, ARTICULOS, TOTAL, 0, 0, 0, TIPO, null, null, null, null, FECHA_VENTA, null, "APROBADO", Usuario, 'BH');

    res.redirect("/locales/BH");

});










module.exports = Router;


