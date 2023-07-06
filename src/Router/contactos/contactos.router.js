const Router = require("express").Router();
const { isLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const {  getContactosByFecha, getFechasContactosByTipo, getContactosByGrupoAndTipo, getGruposByCode} = require("../../model/contactos/contactos.model.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes");
const {generarContactoZ,generarContactoY,generarContactoCTE} = require("../../lib/contactos.js");
const fs = require("fs/promises");
const vcard = require("vcard-generator");


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

    let cte_data;
    if (TIPO == "CTE") {
        cte_data = await getClientes(CTE);
        cte_data = cte_data[0];
    }

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
    const data = {
        title: "Generar VCF",
        items: ["CTE", "IMANES", "Y"],
        links: ["/contactos/VCF/CTE", "/contactos/VCF/Z", "/contactos/VCF/Y"]
    };
    res.render("list-items.ejs", { data });


});
Router.get("/contactos/VCF/:TIPO", isAdmin, async (req, res) => {
    const { TIPO } = req.params;
    const fechas = await getFechasContactosByTipo(TIPO);
    const fechas_arr = fechas.map(fecha => fecha.FECHA);
    const links_arr = fechas_arr.map(fecha => `/contactos/VCF/${TIPO}/${fecha}`)
    const data = {
        title: "Fechas de contactos",
        items: fechas_arr,
        links: links_arr
    };
    res.render("list-items.ejs", { data });

});

Router.get("/contactos/VCF/:TIPO/:FECHA", isAdmin, async (req, res) => {

    const { TIPO, FECHA } = req.params;
    const contactos = await getContactosByFecha(TIPO, FECHA);

    //{CONTACTO : "A2-U8108",TELEFONO = 1124659963}
    let vcard_result = [];
    contactos.forEach(contacto => {
        vcard_result.push(
            vcard.generate({
                version: "2.1",
                formattedNames: [{
                    text: contacto.CONTACTO + "",
                }],
                phones: [{
                    text: contacto.TELEFONO + "",
                }],
            })
        );
    })
 
    await fs.writeFile(`../VCF/${FECHA}-${TIPO}.vcf`, vcard_result.join("\n"));


    res.download(`../VCF/${FECHA}-${TIPO}.vcf`, (err) => {
        if (err) {
            console.log("error al generar contacto", err);
            return res.send("CONTACTO DAÑADO");
        }
        //Elimina el archivo
        fs.unlink(`../VCF/${FECHA}-${TIPO}.vcf`)
    });


});


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




module.exports = Router;