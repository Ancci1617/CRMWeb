const { getFichasByCte } = require("../model/pagos.model");
const {getDoubt} = require("../../lib/doubt.js");
const redistribuirPagoBgm = async ({FICHA,COBRADO,DECLARADO_CUO,DECLARADO_COB,RANGO}) => {


    const [ficha_data] = await getFichasByCte(FICHA, "FICHA");

    const ficha_data_deuda = { data: ficha_data, deuda: getDoubt(ficha_data, RANGO == "COBRADOR" || RANGO == "VENDEDOR") };


    const MORA = Math.min(ficha_data_deuda.deuda.mora, COBRADO);
    const SERV = Math.min(COBRADO - MORA, ficha_data_deuda.deuda.servicio);
    const CUOTA = COBRADO - MORA - SERV;

    return {MORA,SERV,CUOTA,DECLARADO_COB : DECLARADO_COB || MORA + SERV,DECLARADO_CUO : DECLARADO_CUO || CUOTA}
}

module.exports = {redistribuirPagoBgm}