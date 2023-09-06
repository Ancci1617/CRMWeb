const { pagosModel } = require("../model/pagos.model.js");
const { getToday } = require("../../lib/dates.js");
const { getDoubt } = require("../../lib/doubt.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js");
const { getRandomCode } = require("../../lib/random_code.js");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers.js");
const pool = require("../../model/connection-database.js");
const { getRendicion } = require("../model/rendicion.model.js");
const permisos = require("../../constants/permisos.js");
const { getCliente } = require("../../lib/get_cliente.js");
const { getClienteEnFichas } = require("../../model/CRM/tipos/get_data_por_tipo.js");




async function deudaCredito(req, res) {

    const render_obj = { totales: { cuota: 0, serv: 0, mora: 0 }, prestamos: [], fichas: [] };
    const { CREDITO } = req.query;

    const CTE = await getClienteEnFichas(CREDITO);

    [render_obj.cte_data] = await getClientes(CTE);


    if (!render_obj.cte_data.CTE)
        return res.send(`La ficha o prestamo ${CREDITO} no existe`);


    if (CREDITO > 50000) {
        render_obj.prestamos = await pagosModel.getPrestamosByCte(CREDITO, "Prestamo");
    } else {

        fichas_data = await pagosModel.getFichasByCte(CREDITO, "FICHA");
        render_obj.fichas =
            fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") }));

        render_obj.fichas[0].acumulado =
            await pagosModel.getAcumuladoByCteFicha({ CTE: render_obj.fichas[0].data.CTE, FICHA: render_obj.fichas[0].data.FICHA });
    }

    render_obj.usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);


    res.render("pagos/pagos.cte.ejs", render_obj);


}

async function deudaCte(req, res) {
    const { CTE } = req.query;
    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const prestamos = await pagosModel.getPrestamosByCte(CTE);

    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);
    const fichas = fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") }))

    //*Que sea 1 sola consulta usando "in"
    for (let i = 0; i < fichas.length; i++) {
        fichas[i].acumulado = await pagosModel.getAcumuladoByCteFicha({ CTE: fichas[i].data.CTE, FICHA: fichas[i].data.FICHA });
    }
    const cte_data = await getClientes(CTE);


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

    const { CTE, FICHA, MP_PORCENTAJE, N_OPERACION, MP_TITULAR, FECHA_COB, OBS, DECLARADO_CUO = 0, DECLARADO_COB = 0 } = req.body;

    const COBRADO = parseInt(req.body.COBRADO) || parseInt(DECLARADO_COB) + parseInt(DECLARADO_CUO);

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
            CTE, FICHA, CUOTA: resultado_final.cuota,
            MORA: resultado_final.mora, SERV: resultado_final.servicios,
            PROXIMO: FECHA_COB,
            CODIGO, USUARIO: req.user.Usuario,
            FECHA: getToday(), OBS, MP_PORCENTAJE, N_OPERACION, MP_TITULAR,
            DECLARADO_COB: DECLARADO_COB || resultado_final.mora + resultado_final.servicios,
            DECLARADO_CUO: DECLARADO_CUO || resultado_final.cuota
        };


    } else {
        // const ficha_data = await pagosModel.getFicha(FICHA);
        const [ficha_data] = await pagosModel.getFichasByCte(FICHA, "FICHA");

        const ficha_data_deuda = { data: ficha_data, deuda: getDoubt(ficha_data, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") };
       
       
        const MORA = Math.min(ficha_data_deuda.deuda.mora, COBRADO);
        const SERV = Math.min(COBRADO - MORA, ficha_data_deuda.deuda.servicio);
        const CUOTA = COBRADO - MORA - SERV;

        pago_obj = {
            CTE, FICHA, CUOTA,
            MORA, SERV, PROXIMO: FECHA_COB,
            CODIGO, USUARIO: req.user.Usuario,
            FECHA: getToday(), OBS, MP_PORCENTAJE, N_OPERACION, MP_TITULAR,
            DECLARADO_COB: DECLARADO_COB || MORA + SERV,
            DECLARADO_CUO: DECLARADO_CUO || CUOTA
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
    try {
        const pago = await pagosModel.getPagoByCodigo(CODIGO);
        await pagosModel.updateEstadoPagoByCodigo({ filter: { CODIGO }, newState: { CONFIRMACION: "CONFIRMADO" } });
        
        res.redirect(`pasar_cobranza?COB=${pago.COBRADOR}&FECHA=${pago.FECHA}&ORDEN=${ORDEN}`);

    } catch (error) {
        console.error(error);
        res.send("Error al confirmar pago.");
    }

}

async function invalidarPago(req, res) {

    const { CODIGO, FECHA, COB, ORDEN } = req.query;
    const rendicion = await getRendicion({ FECHA, COB });

    //Si la rendicion esta cerrada no se puede editar
    if (!rendicion.EDITABLE) {
        return res.send("La rendicion esta cerrada, no se puede editar");
        //Si el usuario no es el cobrado O no tiene el permiso de borrar el pago.
    } else if (!(res.locals.hasPermission(permisos.PAGOS_GERENCIA) || req.user.Usuario == COB)) {
        return res.send("Sin permisos.");
    }


    await pagosModel.updateEstadoPagoByCodigo({ newState: { CONFIRMACION: "INVALIDO" }, filter: { CODIGO } });
    res.redirect(`pasar_cobranza?COB=${COB}&FECHA=${FECHA}&ORDEN=${ORDEN}`);

}





module.exports = { deudaCte, cargarPago, cambiarFecha, codigoDePago, confirmarPago, deudaFicha, invalidarPago, deudaCredito };









