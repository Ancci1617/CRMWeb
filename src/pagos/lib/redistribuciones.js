const { getFichasByCte } = require("../model/pagos.model");
const { getDoubt } = require("../../lib/doubt.js");
const redistribuirPagoBgm = async ({ FICHA, COBRADO, DECLARADO_CUO, DECLARADO_COB, RANGO }) => {


    const [ficha_data] = await getFichasByCte(FICHA, "FICHA");

    const ficha = { data: ficha_data, deuda: getDoubt(ficha_data, RANGO == "COBRADOR" || RANGO == "VENDEDOR") };

    console.log("🚀 ~ file: redistribuciones.js:10 ~ redistribuirPagoBgm ~ ficha:", ficha)
    // console.log("Datos de la ficha ", ficha)


    let MORA = [0], SERV = [0], CUOTA = [0];


    let servicios_adeudados = ficha.deuda.servicio;
    for (let i = 0; i < ficha.deuda.atraso_evaluado; i++) {
        MORA[i] = 0;
        SERV[i] = 0;
        CUOTA[i] = 0;



        MORA[i] += Math.max(Math.min(ficha.deuda.mora, Math.floor(ficha.data.CUOTA * 0.1 / 100) * 100, COBRADO), 0); // 600
        ficha.deuda.mora -= MORA[i];
        COBRADO -= MORA[i]; //i = 0 ; = 4400


        if (!(servicios_adeudados / ficha.data.SERV_UNIT < ficha.deuda.atraso_evaluado - i)) {

            SERV[i] += Math.max(Math.min(ficha.deuda.servicio, ficha.data.SERV_UNIT, COBRADO), 0); // 1000
            ficha.deuda.servicio -= SERV[i];
            COBRADO -= SERV[i]; // 3400

        }



        CUOTA[i] += Math.max(Math.min(ficha.deuda.cuota, ficha.data.CUOTA, COBRADO), 0); //4400
        ficha.deuda.cuota -= CUOTA[i];
        COBRADO -= CUOTA[i];

    }
    if (COBRADO > 0) CUOTA[CUOTA.length - 1] += COBRADO




    console.log({ MORA, SERV, CUOTA });

    return { MORA: sumarPagos(MORA), SERV: sumarPagos(SERV), CUOTA: sumarPagos(CUOTA), DECLARADO_COB: DECLARADO_COB || sumarPagos([...SERV, ...MORA]), DECLARADO_CUO: DECLARADO_CUO || CUOTA }
}



const sumarPagos = (arr) => {
    return arr.reduce((value, acum) => acum + value, 0)
}

module.exports = { redistribuirPagoBgm }

















