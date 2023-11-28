const pagosModel = require("../model/pagos.model.js");
const { getToday, dateDiff } = require("../../lib/dates.js");
const { getDoubt, getDebtEasy } = require("../../lib/doubt.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js");
const { getRandomCode } = require("../../lib/random_code.js");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers.js");
const pool = require("../../model/connection-database.js");
const { getRendicion } = require("../model/rendicion.model.js");
const permisos = require("../../constants/permisos.js");
const { getClienteEnFichas } = require("../../model/CRM/tipos/get_data_por_tipo.js");
const { getArticulosString } = require("../../model/CRM/get_tablas/get_articulos.js");
const { agregarMeses } = require("../lib/agregar_meses.js");
const { redistribuirPagoBgm } = require("../lib/redistribuciones.js");
const { generarSaldoAnteriorEasyCash, generarSaldoAnteriorBgm } = require("../lib/saldo_anterior.js");




async function deudaCte(req, res) {
    const { FICHA_PRIMERA, N_OPERACION, TITULAR, EsRecorrido = false, Recorrido } = req.query;

    const CTE = req.query.CTE || await getClienteEnFichas(FICHA_PRIMERA);

    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);
    const [cte_data] = await getClientes(CTE);

    const fichas = fichas_data.map(ficha => {
        if (ficha.FICHA >= 50000)
            return { data: ficha, deuda: getDebtEasy(ficha, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") }

        return { data: ficha, deuda: getDoubt(ficha, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") }
    });


    //Si la ficha de FICHA_PRIMERA esta incluida en las fichas de este cliente, la pone primera
    if (fichas_data.map(ficha => ficha.FICHA).includes(FICHA_PRIMERA))
        fichas.sort(ficha => ficha.data.FICHA == FICHA_PRIMERA ? -1 : 1)

    //Por cada una de las fichas consulta el acumulado y un "reduce" con los nombres de los articulos
    for (let i = 0; i < fichas.length; i++) {
        fichas[i].acumulado = await pagosModel.getAcumuladoByCteFicha({ CTE: fichas[i].data.CTE, FICHA: fichas[i].data.FICHA });
        fichas[i].acumulado_detalle = await pagosModel.getAcumuladoDetalle({ FICHA: fichas[i].data.FICHA });
        fichas[i].articulos_string = await getArticulosString(fichas[i].data.ARTICULOS.split(" "));
    }


    //Fichas es un objeto, las propiedades modificadas dentro de la funcion son modificadas en el original
    agregarMeses(fichas);
    console.log(fichas[0]);
    res.render("pagos/pagos.cte.ejs", { fichas, cte_data, usuarios, N_OPERACION, TITULAR, EsRecorrido, Recorrido });
}









//Redistribuye el pago de forma automatica si es BGM
//No redistribuye nada, simplemente carga el pago si es EasyCash
//Luego de eso carga el pago con pagosModel
async function cargarPago(req, res) {


    const { CTE, FICHA, MP_PORCENTAJE, N_OPERACION, MP_TITULAR, FECHA_COB, OBS, DECLARADO_CUO = 0, DECLARADO_COB = 0, DECLARADO_SERV = 0, DECLARADO_MORA = 0, EsRecorrido } = req.body;

    //Aca deberia ir un schema//
    const COBRADO = parseInt(req.body.COBRADO) || parseInt(DECLARADO_COB) + parseInt(DECLARADO_CUO);
    const CODIGO = getRandomCode(6);


    const pago_obj = FICHA >= 50000 ?
        { CUOTA: DECLARADO_CUO, MORA: DECLARADO_MORA, SERV: DECLARADO_SERV } :
        await redistribuirPagoBgm({ FICHA, COBRADO, DECLARADO_COB, DECLARADO_CUO, RANGO: req.user.RANGO });

    const submit_obj = Object.assign(pago_obj,
        {
            CTE, FICHA, PROXIMO: FECHA_COB, CODIGO, USUARIO: req.user.Usuario,
            FECHA: getToday(), OBS, MP_PORCENTAJE, N_OPERACION, MP_TITULAR,
            DECLARADO_COB: parseInt(DECLARADO_SERV) + parseInt(DECLARADO_MORA), DECLARADO_CUO, DECLARADO_SERV
        });

    await pagosModel.cargarPago(submit_obj);


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
        if (pago.FICHA > 50000) {
            await generarSaldoAnteriorEasyCash(pago);
        } else {
            await generarSaldoAnteriorBgm(pago);
        }

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





module.exports = { deudaCte, cargarPago, codigoDePago, confirmarPago, invalidarPago };









