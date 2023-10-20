const pagosModel = require("../model/pagos.model.js");
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
const { getArticulos, getArticulosString } = require("../../model/CRM/get_tablas/get_articulos.js");
const { agregarMeses } = require("../lib/agregar_meses.js");




async function deudaCte(req, res) {
    const { FICHA_PRIMERA, N_OPERACION, TITULAR, EsRecorrido = false } = req.query;

    const CTE = req.query.CTE || await getClienteEnFichas(FICHA_PRIMERA);

    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const prestamos = await pagosModel.getPrestamosByCte(CTE);
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);
    const [cte_data] = await getClientes(CTE);
    const fichas = fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") }));


    //Si la ficha de FICHA_PRIMERA esta incluida en las fichas de este cliente, la pone primera
    if (fichas_data.map(ficha => ficha.FICHA).includes(FICHA_PRIMERA))
        fichas.sort(ficha => ficha.data.FICHA == FICHA_PRIMERA ? -1 : 1)

    //Por cada una de las fichas consulta el acumulado y un "reduce" con los nombres de los articulos
    for (let i = 0; i < fichas.length; i++) {
        fichas[i].acumulado = await pagosModel.getAcumuladoByCteFicha({ CTE: fichas[i].data.CTE, FICHA: fichas[i].data.FICHA });
        fichas[i].articulos_string = await getArticulosString(fichas[i].data.ARTICULOS.split(" "));
    }
    //Fichas es un objeto, las propiedades modificadas dentro de la funcion son modificadas en el original
    agregarMeses(fichas);

    res.render("pagos/pagos.cte.ejs", { fichas , cte_data, usuarios, prestamos, N_OPERACION, TITULAR, EsRecorrido });
}





async function deudaFicha(req, res) {
    const { CTE, FICHA } = req.query;
    const fichas_data = await pagosModel.getFichasByCte(CTE);

    const fichas = fichas_data.filter(ficha_data => ficha_data.FICHA == FICHA);
    if (fichas.length == 0) return res.send("No encontrado");



    const deuda = getDoubt(fichas[0]);
    res.send(`${deuda.atraso_evaluado}`);

}



async function cargarPago(req, res) {

    const { CTE, FICHA, MP_PORCENTAJE, N_OPERACION, MP_TITULAR, FECHA_COB, OBS, DECLARADO_CUO = 0, DECLARADO_COB = 0, EsRecorrido } = req.body;

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


    res.redirect(`/pagos/codigo_pago?CODIGO=${CODIGO}&EsRecorrido=${EsRecorrido}`);

}

async function codigoDePago(req, res) {

    const { CODIGO, EsRecorrido } = req.query;
    const pago = await pagosModel.getPagoByCodigo(CODIGO);
    const [cte_data] = await getClientes(pago.CTE);

    res.render("pagos/pagos.codigo_generado.ejs", { pago, cte_data, EsRecorrido: EsRecorrido == 'true' ? true : false });

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





module.exports = { deudaCte, cargarPago, codigoDePago, confirmarPago, deudaFicha, invalidarPago};









