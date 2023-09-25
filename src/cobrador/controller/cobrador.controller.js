const pagosModel = require("../../pagos/model/pagos.model.js");
const { getDoubt } = require("../../lib/doubt.js");



const postOrdenarRecorridoCobrador = (req, res) => {
    const body = {
        ID: 2000,
        ORDEN: 1
    }

}

const formOrdenarRecorrido = async (req, res) => {
    const fichas_data = await pagosModel.getFichasByCte("D6", "Z");
    console.log(fichas_data);
    const fichas = fichas_data.map(ficha => ({ ficha, deuda: getDoubt(ficha) })).filter(ficha => ficha.deuda.atraso_evaluado > 0);
    console.log("fichas por cobrar", fichas);
    
    //Aca filtrariamos las que corresponden que vallan para el local

    //

    res.render("cobrador/recorrido2.ejs", { fichas })
}



module.exports = { postOrdenarRecorridoCobrador, formOrdenarRecorrido }