const { pagosModel } = require("../model/pagos.model.js");
const { getToday } = require("../../lib/dates.js");
const { getDoubt } = require("../../lib/doubt.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js");

async function deudaCte(req, res) {
    //Voy a buscar cuanto debe esta ficha..
    const { CTE } = req.query;
    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const cte_data = await getClientes(CTE);
    const fichas = fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha) }));

    //Los totales, para renderizar
    const totales = {
        cuota: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.cuota, 0),
        serv: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.servicio, 0),
        mora: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.mora, 0),
    }

    res.render("pagos/pagos.cte.ejs", { fichas, cte_data: cte_data[0], totales });
}



async function cambiarFecha(req, res) {
    const { CTE, FICHA, FECHA_COB } = req.body;
    const { Usuario } = req.user;
    const insert_response = await pagosModel.insertCambioDeFecha({ CTE, FICHA, FECHA_COB, COBRADOR: Usuario, FECHA: getToday() });

    const origin = req.headers.referer;

    res.redirect(origin);
}
async function cargarPago(req, res) {

    const { CTE, FICHA, MP, FECHA_COB } = req.body;
    const COBRADO = parseInt(req.body.COBRADO);

    //Busco la ficha
    const ficha_data = await pagosModel.getFicha(FICHA);

    //DISTRIBUIR
    const ficha_data_deuda = { data: ficha_data, deuda: getDoubt(ficha_data) };
    const MORA = Math.min(ficha_data_deuda.deuda.mora, COBRADO);
    const SERV = Math.min(COBRADO - MORA, ficha_data_deuda.deuda.servicio);
    const cobrado_cuota_aux = Math.min(COBRADO - MORA - SERV, ficha_data_deuda.deuda.servicio);
    const CUOTA = cobrado_cuota_aux + COBRADO - (MORA + SERV + cobrado_cuota_aux);
    const CODIGO = getRandomCode(5);
    const pago_obj = {
        CTE, FICHA, CUOTA,
        MORA, SERV, PROXIMO: FECHA_COB,
        CODIGO, USUARIO: req.user.Usuario,
        FECHA: getToday()
    };

    //ESTO TENDRIA QUE LLEVAR AL CODIGO DEL PAGO;
    await pagosModel.cargarPago(pago_obj);


    res.redirect(`/codigo_pago?CODIGO=${CODIGO}`);

}

async function codigoDePago(req, res) {
    const { CODIGO } = req.query;
    

    res.send("ok");
}

module.exports = { deudaCte, cargarPago, cambiarFecha, codigoDePago };









