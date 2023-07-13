const { getVencidas } = require("../lib/dates");

function getDoubt(ficha_data) {
    const vencidas = getVencidas(new Date(ficha_data.VENCIMIENTO), new Date(), ficha_data.CUOTAS);
    // const deudaCuota = ficha_data.CUOTA * vencidas - ficha_data.TOTAL + ficha_data.CUOTA_ANT - ficha_data.CUOTA_PAGO;
    const deudaCuota = Math.max(ficha_data.CUOTA * vencidas  - ficha_data.TOTAL + ficha_data.CUOTA_ANT  - ficha_data.CUOTA_PAGO,0);
    const pagas = Math.max(Math.floor((ficha_data.TOTAL - ficha_data.SALDO) / ficha_data.CUOTA),0);
    const atraso = Math.max(vencidas - pagas,0);
    const deuda_serv = ficha_data.SERVICIO_ANT - ficha_data.SERV_PAGO + atraso * ficha_data.SERV_UNIT;
    const deuda_mora = ficha_data.MORA_ANT - ficha_data.MORA_PAGO + Math.max(atraso -1,0) * ficha_data.CUOTA * 0.1;
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








