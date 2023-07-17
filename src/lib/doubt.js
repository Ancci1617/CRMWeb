const { getVencidas } = require("../lib/dates");

function getDoubt({ VENCIMIENTO, CUOTAS, CUOTA, TOTAL, CUOTA_ANT, CUOTA_PAGO, SALDO,
    SERVICIO_ANT, SERV_PAGO, SERV_UNIT, MORA_ANT, MORA_PAGO }) {
    //AGREGAR ALGORITMO PARA COBRADOR


    const vencidas = getVencidas(new Date(VENCIMIENTO), new Date(), CUOTAS);
    const deudaCuota = Math.max(CUOTA * vencidas - TOTAL + CUOTA_ANT - CUOTA_PAGO, 0);
    const pagas = Math.max(
        parseFloat(((TOTAL - SALDO) / CUOTA).toFixed(1)), 0);

    const atraso = Math.max(vencidas - Math.floor(pagas), 0);
    const atraso_eval = Math.round(atraso + 0.3);
    const deuda_serv = Math.max(SERVICIO_ANT - SERV_PAGO + atraso_eval * SERV_UNIT, 0);
    const deuda_mora = MORA_ANT - MORA_PAGO + Math.max(atraso_eval - 1, 0) * CUOTA * 0.1;

    return {
        cuota: deudaCuota,
        servicio: deuda_serv,
        vencidas,
        mora: deuda_mora,
        atraso,
        pagas
    }
}

module.exports = { getDoubt }








