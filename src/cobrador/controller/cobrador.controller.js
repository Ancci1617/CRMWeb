"use strict";
const pagosModel = require("../../pagos/model/pagos.model.js");
const cobradorModel = require("../model/cobrador.model.js");
const { getDoubt } = require("../../lib/doubt.js");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers.js");
const { getToday } = require("../../lib/dates.js");



const postOrdenarRecorrido = async (req, res) => {
    const response = await cobradorModel.ordenarRecorrido(req.body);
    res.json(response);
}

const formOrdenarRecorrido = async (req, res) => {
    const { ZONA = "SZ" } = req.query;
    const fichas_data = await cobradorModel.getFichasPorCobrar({ filter: { "Z": ZONA } });

    const fichas = fichas_data.map(ficha => ({ ficha, deuda: getDoubt(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);

    //Aca filtrariamos las que corresponden que vallan para el local
    res.render("cobrador/recorrido2.ejs", { fichas })
}



const postCambiarFecha = async (req,res) => {
    const {FICHA,FECHA_COB,ZONA} = req.body;
    await cobradorModel.insertCambioDeFecha({FICHA,FECHA : FECHA_COB,COBRADOR : req.user.Usuario,TODAY : getToday()}); 

    res.redirect(`recorrido/${ZONA}`);
}


const postVolver = async (req,res) => {
    const {ZONA,FICHA} = req.query;
    await cobradorModel.volverAlFinal({FICHA ,ZONA});
    res.redirect(`/cobrador/recorrido/${ZONA}`);
}
const formIniciarRecorrido = async (req,res) => {

    const {ZONA} = req.params;
    let fichas_data = await cobradorModel.getFichasPorCobrar({filter : {Z : ZONA }});
    let fichas = fichas_data.map(ficha => ({ ficha, deuda: getDoubt(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);
    fichas.splice(6,fichas.length);

    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);
    
    res.render("cobrador/iniciar.ejs",{ fichas ,usuarios});
}

module.exports = { postOrdenarRecorrido, formOrdenarRecorrido ,postCambiarFecha,postVolver,formIniciarRecorrido}










