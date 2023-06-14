const Router = require("express").Router();
const pool = require("../../model/connection-database");
const { isLoggedIn, isNotLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const { getContactosImanes, getContactosCtes, getContactosY, getGruposByCode } = require("../../model/contactos/contactos.model.js");
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
    const eval = { Z: "IMANES", Y: "NUEVOS", CTE: "CTE" };
    if (!eval[CODE]) return res.send("CODIGO DE CONTACTO NO VALIDO");

    const render_object = {};
    render_object.grupos = await getGruposByCode(CODE);

    res.render("contactos/contactos.ejs",  render_object );

});


Router.post("/contactos/getContactos", isAdmin, async (req, res) => {

})

module.exports = Router;