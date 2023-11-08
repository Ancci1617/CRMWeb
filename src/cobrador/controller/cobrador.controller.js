"use strict";
const pagosModel = require("../../pagos/model/pagos.model.js");
const cobradorModel = require("../model/cobrador.model.js");
const { getDoubt, getDebtEasy } = require("../../lib/doubt.js");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers.js");
const { getToday } = require("../../lib/dates.js");



const postOrdenarRecorrido = async (req, res) => {
    const response = await cobradorModel.ordenarRecorrido(req.body);
    res.json(response);
}

const formOrdenarRecorrido = async (req, res) => {
    const { ZONA = "SZ" } = req.query;

    if (ZONA == "Easy") {
        const fichas_data = await cobradorModel.getFichasPorCobrar({ filter: { "true": true } ,isEasyCash : true});
        const fichas = fichas_data.filter(ficha => ficha.FICHA >= 50000).map(ficha => ({ ficha, deuda: getDebtEasy(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);

        return res.render("cobrador/recorrido2.ejs", { fichas });
    }

    const fichas_data = await cobradorModel.getFichasPorCobrar({ filter: { "Z": ZONA } });

    let fichas = fichas_data.map(ficha => ({ ficha, deuda: ficha.FICHA >= 50000 ? getDebtEasy(ficha) : getDoubt(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);

    //Aca filtrariamos las que corresponden que vallan para el local
    res.render("cobrador/recorrido2.ejs", { fichas });
}





const postCambiarFecha = async (req, res) => {
    const { FICHA, FECHA_COB, ZONA } = req.body;
    await cobradorModel.insertCambioDeFecha({ FICHA, FECHA: FECHA_COB, COBRADOR: req.user.Usuario, TODAY: getToday() });

    res.redirect(`recorrido/${ZONA}`);
}


const postVolver = async (req, res) => {
    const { ZONA, FICHA } = req.query;
    await cobradorModel.volverAlFinal({ FICHA, ZONA, Usuario: req.user.Usuario });
    res.redirect(`/cobrador/recorrido/${ZONA}`);


}
const formIniciarRecorrido = async (req, res) => {

    let fichas_data, fichas;
    const { ZONA } = req.params;
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);

    if (ZONA == "Easy") {
        fichas_data = await cobradorModel.getFichasPorCobrar({ filter: { "true": true } });
        fichas = fichas_data.filter(ficha => ficha.FICHA >= 50000).map(ficha => ({ ficha, deuda: getDebtEasy(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);
    } else {
        fichas_data = await cobradorModel.getFichasPorCobrar({ filter: { Z: ZONA } });
        fichas = fichas_data.map(ficha => ({ ficha, deuda: ficha.FICHA >= 50000 ? getDebtEasy(ficha) : getDoubt(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);
    }

    
    fichas.splice(6, fichas.length);
    res.render("cobrador/iniciar.ejs", { fichas, usuarios });
}

module.exports = { postOrdenarRecorrido, formOrdenarRecorrido, postCambiarFecha, postVolver, formIniciarRecorrido }










