const { pagosModel } = require("../model/pagos.model.js");
const { getToday } = require("../../lib/dates.js");
const { getDoubt } = require("../../lib/doubt.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js");
const { getRandomCode } = require("../../lib/random_code.js");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers.js");

async function deudaCte(req, res) {
    //Voy a buscar cuanto debe esta ficha..
    const { CTE } = req.query;
    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const prestamos = await pagosModel.getPrestamosByCte(CTE);

    const cte_data = await getClientes(CTE);
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);

    const fichas = fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha,req.user.RANGO == "COBRADOR") }))

    for (let i = 0; i < fichas.length; i++) {
        fichas[i].acumulado = await pagosModel.getAcumuladoByCteFicha({ CTE: fichas[i].data.CTE, FICHA: fichas[i].data.FICHA });
    }

    //Los totales, para renderizar
    const totales = {
        cuota: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.cuota, 0),
        serv: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.servicio, 0),
        mora: fichas.reduce((accumulator, ficha) => accumulator + ficha.deuda.mora, 0)
    }
    res.render("pagos/pagos.cte.ejs", { fichas, cte_data: cte_data[0], totales, usuarios, prestamos });
}

async function deudaFicha(req, res) {
    const { CTE, FICHA } = req.query;
    const fichas_data = await pagosModel.getFichasByCte(CTE);

    const fichas = fichas_data.filter(ficha_data => ficha_data.FICHA == FICHA);
    if (fichas.length == 0) return res.send("No encontrado");
    

    const deuda = getDoubt(fichas[0]);
    res.send(`${deuda.atraso_evaluado}`);

}

async function cambiarFecha(req, res) {
    const { CTE, FICHA, FECHA_COB } = req.body;
    const { Usuario } = req.user;
    const insert_response = await pagosModel.insertCambioDeFecha({ CTE, FICHA, FECHA_COB, COBRADOR: Usuario, FECHA: getToday() });

    const origin = req.headers.referer;

    res.redirect(origin);
}

async function cargarPago(req, res) {

    const { CTE, FICHA, MP_PORCENTAJE, N_OPERACION, MP_TITULAR, FECHA_COB, OBS } = req.body;
    const COBRADO = parseInt(req.body.COBRADO);
    console.log("body cargar pago", req.body);
    const CODIGO = getRandomCode(6);


    //DISTRIBUIR
    let pago_obj = {};
    if (FICHA >= 50000) {
        const prestamo_arr = await pagosModel.getPrestamosByCte(CTE);
        const prestamo = prestamo_arr.find(prestamo => prestamo.Prestamo == FICHA);
        
        let { SERVICIOS, MORA, DEUDA_CUO } = prestamo;
        let cuota_paga_1 = Math.min(COBRADO * 0.5, DEUDA_CUO);
        let mora_paga_1 = Math.min((COBRADO - cuota_paga_1) * 0.5, MORA);
        let serv_paga_1 = Math.min((COBRADO - cuota_paga_1) * 0.5, SERVICIOS);
        const remanente_a_distribuir = COBRADO - (cuota_paga_1 + mora_paga_1 + serv_paga_1);
        let mora_paga_2 = Math.min(MORA - mora_paga_1, remanente_a_distribuir);
        let serv_paga_2 = Math.min(SERVICIOS - serv_paga_1, remanente_a_distribuir - mora_paga_2);
        let cuota_paga_2 = remanente_a_distribuir - mora_paga_2 - serv_paga_2;
        const resultado_final = { mora: 0, servicios: 0, cuota: 0 };

        if (DEUDA_CUO - (cuota_paga_2 + cuota_paga_1) <= 0) {

            if (MORA - (mora_paga_1 + mora_paga_2) > 0) {

                resultado_final.mora = (mora_paga_1 + mora_paga_2) + Math.min(MORA - (mora_paga_1 + mora_paga_2), 100);
                resultado_final.cuota = (cuota_paga_1 + cuota_paga_2) - Math.min(MORA - (mora_paga_1 + mora_paga_2), 100);
                resultado_final.servicios = serv_paga_1 + serv_paga_2;

            } else if (SERVICIOS - (serv_paga_1 + serv_paga_2) > 0) {

                resultado_final.servicios = (serv_paga_1 + serv_paga_2) + Math.min(SERVICIOS - (serv_paga_1 + serv_paga_2), 100);
                resultado_final.cuota = (cuota_paga_1 + cuota_paga_2) - Math.min(SERVICIOS - (serv_paga_1 + serv_paga_2), 100);
                resultado_final.mora = mora_paga_1 + mora_paga_2;

            } else {
                resultado_final.mora = mora_paga_1 + mora_paga_2;
                resultado_final.cuota = cuota_paga_1 + cuota_paga_2;
                resultado_final.servicios = serv_paga_1 + serv_paga_2;    
            }

        } else {
            resultado_final.mora = mora_paga_1 + mora_paga_2;
            resultado_final.cuota = cuota_paga_1 + cuota_paga_2;
            resultado_final.servicios = serv_paga_1 + serv_paga_2;
        }



        pago_obj = {
            CTE, FICHA, CUOTA : resultado_final.cuota,
            MORA : resultado_final.mora, SERV : resultado_final.servicios, 
            PROXIMO: FECHA_COB,
            CODIGO, USUARIO: req.user.Usuario,
            FECHA: getToday(), OBS, MP_PORCENTAJE, N_OPERACION, MP_TITULAR
        };

        
    } else {
        const ficha_data = await pagosModel.getFicha(FICHA);
        const ficha_data_deuda = { data: ficha_data, deuda: getDoubt(ficha_data,req.user.RANGO == "COBRADOR") };
        const MORA = Math.min(ficha_data_deuda.deuda.mora, COBRADO);
        const SERV = Math.min(COBRADO - MORA, ficha_data_deuda.deuda.servicio);
        const CUOTA = COBRADO - MORA - SERV;

        pago_obj = {
            CTE, FICHA, CUOTA,
            MORA, SERV, PROXIMO: FECHA_COB,
            CODIGO, USUARIO: req.user.Usuario,
            FECHA: getToday(), OBS, MP_PORCENTAJE, N_OPERACION, MP_TITULAR
        };
    }

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

    const { CODIGO, ORDEN } = req.query;
    const pago = await pagosModel.getPagoByCodigo(CODIGO);
    await pagosModel.updateEstadoPagoByCodigo({ CODIGO, ESTADO: "CONFIRMADO" });
    res.redirect(`pasar_cobranza?COB=${pago.COBRADOR}&FECHA=${pago.FECHA}&ORDEN=${ORDEN}`);

}

module.exports = { deudaCte, cargarPago, cambiarFecha, codigoDePago, confirmarPago, deudaFicha };









