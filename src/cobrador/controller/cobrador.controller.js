const pagosModel = require("../../pagos/model/pagos.model.js");
const cobradorModel = require("../model/cobrador.model.js");
const { getDoubt } = require("../../lib/doubt.js");



const postOrdenarRecorrido = async (req, res) => {
    console.log("bodyrecibido ", req.body);
    const response = await cobradorModel.ordenarRecorrido(req.body);
    res.json(response)

}

const formOrdenarRecorrido = async (req, res) => {
    const { ZONA = "SZ"} = req.query;
    const fichas_data = await cobradorModel.getFichasPorCobrar({ filter: "Z", data: ZONA });

    // console.log("fichas por cobrar", fichas_data.map(ficha => ficha.FICHA).join(","));
    const fichas = fichas_data.map(ficha => ({ ficha, deuda: getDoubt(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);
    // fichas.splice(1,fichas.length - 5)
    // console.log("fichas por cobrar", fichas.map(ficha => ficha.ficha.FICHA));


    //Aca filtrariamos las que corresponden que vallan para el local
    res.render("cobrador/recorrido2.ejs", { fichas })
}



module.exports = { postOrdenarRecorrido, formOrdenarRecorrido }










