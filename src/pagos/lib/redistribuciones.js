const { getFichasByCte } = require("../model/pagos.model");
const { getDoubt } = require("../../lib/doubt.js");
const redistribuirPagoBgm = async ({ FICHA, COBRADO, DECLARADO_CUO, DECLARADO_COB, RANGO, FECHA_EVALUAR }) => {


    const [ficha_data] = await getFichasByCte(FICHA, "FICHA");

    const ficha = { data: ficha_data, deuda: getDoubt(ficha_data, RANGO == "COBRADOR" || RANGO == "VENDEDOR", FECHA_EVALUAR) };


    let MORA = [0], SERV = [0], CUOTA = [0];
    MORA[0] = Math.max(Math.min(ficha.deuda.mora, COBRADO), 0);
    COBRADO -= MORA[0];

    for (let i = 0; i < ficha.deuda.atraso_evaluado; i++) {
        SERV[i] = 0;
        CUOTA[i] = 0;


        SERV[i] += Math.max(Math.min(ficha.deuda.servicio, ficha.data.SERV_UNIT, COBRADO), 0);
        ficha.deuda.servicio -= SERV[i];
        COBRADO -= SERV[i];

        CUOTA[i] += Math.max(Math.min(ficha.deuda.cuota, ficha.data.CUOTA, COBRADO), 0);
        ficha.deuda.cuota -= CUOTA[i];
        COBRADO -= CUOTA[i];

    }
    if (COBRADO > 0) CUOTA[CUOTA.length - 1] += COBRADO




    return { MORA: sumarPagos(MORA), SERV: sumarPagos(SERV), CUOTA: sumarPagos(CUOTA), DECLARADO_COB: DECLARADO_COB || sumarPagos([...SERV, ...MORA]), DECLARADO_CUO: DECLARADO_CUO || CUOTA }
}



const sumarPagos = (arr) => {
    return arr.reduce((value, acum) => acum + value, 0)
}

module.exports = { redistribuirPagoBgm }

















