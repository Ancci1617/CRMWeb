const pagosModel = require("../model/pagos.model.js");
const { getToday } = require("../../lib/dates.js");
const { getDoubt, getVencimientoValido } = require("../../lib/doubt.js");
const { getClientes, getClientesFull } = require("../../model/CRM/get_tablas/get_clientes.js");
const { getRandomCode } = require("../../lib/random_code.js");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers.js");
const pool = require("../../model/connection-database.js");
const { getRendicion } = require("../model/rendicion.model.js");
const permisos = require("../../constants/permisos.js");
const { getCliente } = require("../../lib/get_cliente.js");
const { getClienteEnFichas } = require("../../model/CRM/tipos/get_data_por_tipo.js");
const { getArticulos, getArticulosString } = require("../../model/CRM/get_tablas/get_articulos.js");



async function deudaCredito(req, res) {
    const render_obj = { totales: { cuota: 0, serv: 0, mora: 0 }, prestamos: [], fichas: [] };
    const { CREDITO, N_OPERACION, TITULAR, EsRecorrido = false } = req.query;


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

        render_obj.fichas[0].articulos_string = await getArticulosString(render_obj.fichas[0].data.ARTICULOS.split(" "));

    }

    render_obj.usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);
    render_obj.N_OPERACION = N_OPERACION;
    render_obj.TITULAR = TITULAR;
    render_obj.EsRecorrido = EsRecorrido;



    //Agrega los 0 para atras en los acumulados
    render_obj.fichas.forEach(ficha => {
        while (new Date(ficha.acumulado[0]?.MES_ANIO) > new Date(getVencimientoValido({ VENCIMIENTO: ficha.data.VENCIMIENTO, PRIMER_PAGO: ficha.data.PRIMER_PAGO }).VENCIMIENTO_EVALUA)) {
            const { acumulado: first_acumulado } = ficha;
            const { MES_ANIO } = first_acumulado[0];
            const fecha_aux = new Date(MES_ANIO);
            const mes_anio_date = new Date(fecha_aux.getUTCFullYear(), fecha_aux.getUTCMonth() - 1);
            const [year, month] = mes_anio_date.toISOString().split("-");
            const obj = { MES_ANIO: `${year}-${month}`, MES: parseInt(month), CUOTA: 0, MORA: 0, SERV: 0 };
            ficha.acumulado.unshift(obj);
        }
    })
    //Por cada una de las fichas quiero que agrege en Cada uno de los acumulados los 0..

    render_obj.fichas.forEach(ficha => {

        for (let i = 1; i < ficha.acumulado.length; i++) {

            const auxiliar = new Date(ficha.acumulado[i - 1].MES_ANIO);

            if (new Date(ficha.acumulado[i].MES_ANIO).toISOString().split("T")[0]
                !=
                new Date(auxiliar.getUTCFullYear(), auxiliar.getUTCMonth() + 1).toISOString().split("T")[0]) {


                const fecha_aux = new Date(ficha.acumulado[i - 1].MES_ANIO);
                const mes_anio_date = new Date(fecha_aux.getUTCFullYear(), fecha_aux.getUTCMonth() + 1);
                const [year, month] = mes_anio_date.toISOString().split("-");
                ficha.acumulado.splice(i, 0, { MES_ANIO: `${year}-${month}`, MES: parseInt(month), CUOTA: 0, MORA: 0, SERV: 0 });
                i = i + 2;
            }

        }

    })


    res.render("pagos/pagos.cte.ejs", render_obj);

}

async function deudaCte(req, res) {
    const { CTE, FICHA_PRIMERA, N_OPERACION, TITULAR, EsRecorrido = false } = req.query;

    const fichas_data = await pagosModel.getFichasByCte(CTE);
    const prestamos = await pagosModel.getPrestamosByCte(CTE);

    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN", "COBRADOR"], [""]);
    const fichas = fichas_data.map(ficha => ({ data: ficha, deuda: getDoubt(ficha, req.user.RANGO == "COBRADOR" || req.user.RANGO == "VENDEDOR") }))

    if (fichas_data.map(ficha => ficha.FICHA).includes(FICHA_PRIMERA))
        fichas.sort(ficha => ficha.data.FICHA == FICHA_PRIMERA ? -1 : 1)


        for (let i = 0; i < fichas.length; i++) {
        fichas[i].acumulado = await pagosModel.getAcumuladoByCteFicha({ CTE: fichas[i].data.CTE, FICHA: fichas[i].data.FICHA });
        fichas[i].articulos_string = await getArticulosString(fichas[i].data.ARTICULOS.split(" "));
    }

    const cte_data = await getClientes(CTE);

    fichas.forEach(ficha => {
        while (new Date(ficha.acumulado[0]?.MES_ANIO) > new Date(getVencimientoValido({ VENCIMIENTO: ficha.data.VENCIMIENTO, PRIMER_PAGO: ficha.data.PRIMER_PAGO }).VENCIMIENTO_EVALUA)) {
            const { acumulado: first_acumulado } = ficha;
            const { MES_ANIO } = first_acumulado[0];
            const fecha_aux = new Date(MES_ANIO);
            const mes_anio_date = new Date(fecha_aux.getUTCFullYear(), fecha_aux.getUTCMonth() - 1);
            const [year, month] = mes_anio_date.toISOString().split("-");
            const obj = { MES_ANIO: `${year}-${month}`, MES: parseInt(month), CUOTA: 0, MORA: 0, SERV: 0 };
            ficha.acumulado.unshift(obj);
        }
    })

    fichas.forEach(ficha => {

        for (let i = 1; i < ficha.acumulado.length; i++) {

            const auxiliar = new Date(ficha.acumulado[i - 1].MES_ANIO);

            if (new Date(ficha.acumulado[i].MES_ANIO).toISOString().split("T")[0]
                !=
                new Date(auxiliar.getUTCFullYear(), auxiliar.getUTCMonth() + 1).toISOString().split("T")[0]) {


                const fecha_aux = new Date(ficha.acumulado[i - 1].MES_ANIO);
                const mes_anio_date = new Date(fecha_aux.getUTCFullYear(), fecha_aux.getUTCMonth() + 1);
                const [year, month] = mes_anio_date.toISOString().split("-");
                ficha.acumulado.splice(i, 0, { MES_ANIO: `${year}-${month}`, MES: parseInt(month), CUOTA: 0, MORA: 0, SERV: 0 });
                i = i + 2;
            }

        }

    })
    
    fichas.forEach(ficha => {
        ficha.acumulado = ficha.acumulado.map(acumulado => {
            const {MES_ANIO,MES,CUOTA,MORA,SERV} = acumulado
            return {MES_ANIO,MES,DIFERENCIA : CUOTA - ficha.data.CUOTA  ,CUOTA,MORA,SERV};
        })
    })
    

    res.render("pagos/pagos.cte.ejs", { fichas, cte_data: cte_data[0], usuarios, prestamos, N_OPERACION, TITULAR, EsRecorrido });
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
    console.log("query", req.query);

    const pago = await pagosModel.getPagoByCodigo(CODIGO);
    const cte_data = await getClientes(pago.CTE);

    res.render("pagos/pagos.codigo_generado.ejs", { pago, cte_data: cte_data[0], EsRecorrido: EsRecorrido == 'true' ? true : false });

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





module.exports = { deudaCte, cargarPago, codigoDePago, confirmarPago, deudaFicha, invalidarPago, deudaCredito };









