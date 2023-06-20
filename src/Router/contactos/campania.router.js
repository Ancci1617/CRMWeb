const Router = require("express").Router();
const { render } = require("ejs");
const { isLoggedIn} = require("../../lib/auth");
const { getContactosParaCampania, getGruposByCode, updateContactoLlamado } = require("../../model/contactos/contactos.model.js");


Router.get("/contactos/campania",isLoggedIn, async (req,res)=>{
    const TIPO = "CTE"
    const { GRUPO = 1 } = req.query;

    const render_object = {};
    render_object.tipo = TIPO;
    render_object.grupo_vigente = GRUPO;
    render_object.grupos = await getGruposByCode(TIPO);
    render_object.contactos = await getContactosParaCampania(GRUPO);

    res.render("contactos/contactos.campania.ejs", render_object);
});

Router.post("/contactos/campania/descartar",isLoggedIn, async (req,res)=>{ 
    const {ESTADO,ID,GRUPO} = req.body;
    await updateContactoLlamado(ESTADO,ID);
    
    res.redirect(`/contactos/campania?GRUPO=${GRUPO}`);
});




module.exports = Router;



