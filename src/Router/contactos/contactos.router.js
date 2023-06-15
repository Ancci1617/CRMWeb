const Router = require("express").Router();
const pool = require("../../model/connection-database");
const { isLoggedIn, isNotLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const { getContactosByGrupoAndTipo, getGruposByCode } = require("../../model/contactos/contactos.model.js");
const { render } = require("ejs");


Router.get("/contactos", isLoggedIn, isAdmin, (req, res) => {
    const data = {
        title: "Contactos",
        items: ["CTE", "IMANES", "Y"],
        links: ["/contactos/CTE", "/contactos/Z", "/contactos/Y"]
    };
    res.render("list-items.ejs", { data });
});

Router.get("/contactos/:CODE", isAdmin, async (req, res) => {
    const { CODE } = req.params;
    const { GRUPO } = req.query;
    const eval = { Z: "Imanes", Y: "Y", CTE: "CTE" };
    if (!eval[CODE]) return res.send("CODIGO DE CONTACTO NO VALIDO");

    const render_object = {};
    render_object.tipo = eval[CODE];
    render_object.grupo_vigente = GRUPO;
    render_object.grupos = await getGruposByCode(CODE);
    render_object.contactos = await getContactosByGrupoAndTipo(CODE, GRUPO);
    res.render("contactos/contactos.ejs", render_object);

});


Router.get("/contactos/generar_contacto/:CTE", isAdminOrVendedor, async (req, res) => {
    res.render("contactos/contactos.cargar.ejs");
})

module.exports = Router;