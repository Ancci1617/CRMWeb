const { getVencidas, getToday, sumarMeses } = require("../lib/dates");

function getDoubt({ VENCIMIENTO, CUOTAS, CUOTA, TOTAL, CUOTA_ANT, CUOTA_PAGO, SALDO,
    SERVICIO_ANT, SERV_PAGO, SERV_UNIT, MORA_ANT, MORA_PAGO }) {
    //AGREGAR ALGORITMO PARA COBRADOR


    const vencidas = getVencidas(new Date(VENCIMIENTO), new Date(getToday()), CUOTAS);
    const deudaCuota = Math.max(CUOTA * vencidas - TOTAL + CUOTA_ANT - CUOTA_PAGO, 0);
    const pagas =
        Math.max(
            Math.trunc((TOTAL - SALDO) / CUOTA * 10) / 10,
            0);

    const atraso = parseFloat(Math.max(vencidas - pagas, 0).toFixed(1));

    const atraso_eval = Math.max(Math.ceil(vencidas - (pagas + 0.3)), 0);

    const deuda_serv = Math.max(SERVICIO_ANT - SERV_PAGO + atraso_eval * SERV_UNIT, 0);

    const deuda_mora = MORA_ANT - MORA_PAGO + Math.max(atraso_eval - 1, 0) * CUOTA * 0.1;

    console.log("VENCIMIENTO", VENCIMIENTO);

    console.log("SUMARMESES", sumarMeses(new Date(VENCIMIENTO), Math.floor(pagas)));


    const vencimiento_vigente = sumarMeses(new Date(VENCIMIENTO), Math.floor(pagas)).toISOString().split("T")[0];

    return {
        cuota: deudaCuota,
        servicio: deuda_serv,
        vencidas,
        mora: deuda_mora,
        atraso,
        atraso_evaluado: atraso_eval,
        pagas, vencimiento_vigente
    }
}

module.exports = { getDoubt }








