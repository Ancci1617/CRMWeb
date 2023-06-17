const Router = require("express").Router();
const { isLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const { getContactosByGrupoAndTipo, getGruposByCode, getContactoByTelefono, insertContacto, invalidarTelefono } = require("../../model/contactos/contactos.model.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes");
const { today } = require("../../lib/dates");

Router.get("/contactos", isLoggedIn, isAdmin, (req, res) => {
    const data = {
        title: "Contactos",
        items: ["CTE", "IMANES", "Y", "VCF"],
        links: ["/contactos/CTE", "/contactos/Z", "/contactos/Y", "/contactos/VCF"]
    };
    res.render("list-items.ejs", { data });
});




Router.get("/contactos/generar_contacto/:CTE", isAdminOrVendedor, async (req, res) => {
    const { TIPO } = req.query;
    const { CTE } = req.params;
    console.log("CTE",CTE);
    let cte_data;
    if (TIPO == "CTE") {
        cte_data = await getClientes(CTE);
        cte_data = cte_data[0];
    }

    console.log("DATA",cte_data);
    console.log("GENERARCONTACTO");

    res.render("contactos/contactos.cargar.ejs", { TIPO, CTE, cte_data });
})

Router.post("/contactos/generar_contacto", isAdminOrVendedor, async (req, res) => {

    const { Usuario } = req.user;
    const { CTEYZ, ZONA, TELEFONO, NOMBRE, CALLE, TIPO } = req.body;

    const eval = {
        CTE: generarContactoCTE,
        Y: generarContactoY,
        Z: generarContactoZ
    }
    if (!eval[TIPO]) return res.send("EL ID DE CONTACTO NO ES VALIDO");

    await eval[TIPO](CTEYZ, Usuario, req.body);

    res.redirect("/CRM")

});

Router.get("/contactos/VCF", isAdmin, async (req, res) => {
    res.send("NO HABILITADO");
})
Router.get("/contactos/:CODE", isAdmin, async (req, res) => {
    const { CODE } = req.params;
    const { GRUPO = 1 } = req.query;
    const eval = { Z: "Z", Y: "Y", CTE: "CTE" };
    if (!eval[CODE]) return res.send("CODIGO DE CONTACTO NO VALIDO");


    const render_object = {};
    render_object.tipo = eval[CODE];
    render_object.grupo_vigente = GRUPO;
    render_object.grupos = await getGruposByCode(CODE);
    render_object.contactos = await getContactosByGrupoAndTipo(CODE, GRUPO);
    res.render("contactos/contactos.ejs", render_object);

});

//Volver promesas?? (Ventaja entre promesas y Funciona asincrona)
async function generarContactoCTE(CTE, Usuario, body) {
    const { CTEYZ, ZONA, TELEFONO, NOMBRE, CALLE, TIPO } = body;
    if (!checkPhoneFormat(TELEFONO)) return

    const cte_data = await getClientes(CTE);

    if (!cte_data[0].CTE) return "Cliente invalido"

    await invalidarTelefono(TELEFONO);
    return await insertContacto("CTE", TELEFONO, today, CTE, cte_data[0].ZONA, cte_data[0].NOMBRE, cte_data[0].CALLE, Usuario);

}

async function generarContactoY(Y, Usuario, body) {
    let { CTEYZ, ZONA, TELEFONO, NOMBRE, CALLE, TIPO } = body;
    if (!checkPhoneFormat(TELEFONO)) return

    const contactos = await getContactoByTelefono(TELEFONO);

    if (contactos.length > 0) {
        const tipos = contactos.map(contacto => contacto.TIPO);
        if (tipos.includes("CTE")) return "El contacto, ya pertenece a un cliente, no se puede cargar como nuevo...";
        if (tipos.includes("Z")) return "El contacto, ya pertenece a un IMAN, no se puede cargar como nuevo...";
    }

    ZONA = ZONA ? ZONA : "SZ";
    CALLE = CALLE ? CALLE : "SD";
    NOMBRE = NOMBRE ? NOMBRE : "SN";


    await invalidarTelefono(TELEFONO);
    return await insertContacto(TIPO, TELEFONO, today, 'YTEST', ZONA, NOMBRE, CALLE, Usuario);

}

async function generarContactoZ(Z, Usuario, body) {
    const { CTEYZ, ZONA, TELEFONO, NOMBRE, CALLE, TIPO } = body;
    if (!checkPhoneFormat(TELEFONO)) return

    const contactos = await getContactoByTelefono(TELEFONO);

    if (contactos.length > 0) {
        const tipos = contactos.map(contacto => contacto.TIPO);
        if (tipos.includes("CTE")) return "El contacto, ya pertenece a un cliente, no se puede cargar como nuevo...";
    }

    await invalidarTelefono(TELEFONO);
    return await insertContacto(TIPO, TELEFONO, today, 'YTEST', ZONA, NOMBRE, CALLE, Usuario);

}

function checkPhoneFormat() {
    return true;
}

module.exports = Router;