const pagosModel = require("../../pagos/model/pagos.model.js");
const cobradorModel = require("../model/cobrador.model.js");
const { getDoubt } = require("../../lib/doubt.js");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers.js");



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

const formDeudaRecorrido = async (req, res) => {
    const { ZONA, ORDEN } = req.query;

    const fichas_data = await cobradorModel.getFichasPorCobrar({ filter: { "Z": ZONA, ORDEN_COBRANZA: ORDEN } });
    
    const fichas =
        fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") }));

    fichas[0].acumulado =
        await pagosModel.getAcumuladoByCteFicha({ CTE: fichas_data[0].CTE, FICHA: fichas_data[0].FICHA });

        const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);

    res.render("pagos/pagos.recorrido.ejs", { fichas: [fichas[0]], usuarios,ORDEN });


}

const postCambiarFecha = async (req,res) => {
    const {CTE,FICHA,FECHA_COB,ZONA} = req.body;
    await cobradorModel.insertCambioDeFecha({FICHA,FECHA : FECHA_COB,COBRADOR : req.user.Usuario}); 

    res.redirect(`recorrido?ZONA=${ZONA}`);
}


const postVolver = async (req,res) => {
    const {ZONA,FICHA,ORDEN} = req.query;
    await cobradorModel.volverAlFinal({FICHA : req.query.FICHA});
    res.redirect(`/cobrador/deuda?ORDEN=${parseInt(ORDEN) + 1}&ZONA=${ZONA}`);
}


module.exports = { postOrdenarRecorrido, formOrdenarRecorrido, formDeudaRecorrido ,postCambiarFecha,postVolver}










