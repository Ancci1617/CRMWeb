const { pagosModel } = require("../model/pagos.model.js");
const { getToday } = require("../../lib/dates.js");
const { getDoubt } = require("../../lib/doubt.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js");
const { getRandomCode } = require("../../lib/random_code.js");
async function deudaCteTest(req, res) {

    //Voy a buscar cuanto debe esta ficha..
    const { CTE, FICHA } = req.query;
    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const fichas = fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha) }));

    //Los totales, para renderizar
    let ficha_buscada = fichas.filter(ficha => ficha.data.FICHA == FICHA);
    res.send(`${ficha_buscada[0].deuda.cuota},${ficha_buscada[0].deuda.servicio},${ficha_buscada[0].deuda.mora}`);

}

async function deudaCte(req, res) {
    //Voy a buscar cuanto debe esta ficha..
    const { CTE } = req.query;
    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const cte_data = await getClientes(CTE);
    const fichas = fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha) }));

    for (let i = 0; i < fichas.length; i++) {
        fichas[i].acumulado = await pagosModel.getAcumuladoByCteFicha({ CTE: fichas[i].data.CTE, FICHA: fichas[i].data.FICHA });
    }
    //Los totales, para renderizar
    const totales = {
        cuota: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.cuota, 0),
        serv: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.servicio, 0),
        mora: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.mora, 0)
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
    const CUOTA = COBRADO - MORA - SERV;
    const CODIGO = getRandomCode(5);
    const pago_obj = {
        CTE, FICHA, CUOTA,
        MORA, SERV, PROXIMO: FECHA_COB,
        CODIGO, USUARIO: req.user.Usuario,
        FECHA: getToday()
    };

    //ESTO TENDRIA QUE LLEVAR AL CODIGO DEL PAGO;
    await pagosModel.cargarPago(pago_obj);


    res.redirect(`/pagos/codigo_pago?CODIGO=${CODIGO}`);

}

async function codigoDePago(req, res) {

    const { CODIGO } = req.query;
    const pago = await pagosModel.getPagoByCodigo(CODIGO);
    const cte_data = await getClientes(pago.CTE);
    res.render("pagos/pagos.codigo_generado.ejs", { pago, cte_data: cte_data[0] });

}

async function confirmarPago(req, res) {

    const { CODIGO } = req.query;
    const pago = await pagosModel.getPagoByCodigo(CODIGO);
    await pagosModel.updateEstadoPagoByCodigo({CODIGO, ESTADO :"CONFIRMADO"});
    res.redirect(`pasar_cobranza?COB=${pago.COBRADOR}&FECHA=${pago.FECHA}`);
    
}

module.exports = { deudaCte, cargarPago, cambiarFecha, codigoDePago, deudaCteTest ,confirmarPago};









