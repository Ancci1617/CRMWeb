function getDoubt(ficha_data) {
    const vencidas = getVencidas(new Date(ficha_data.VENCIMIENTO), new Date(), ficha_data.CUOTAS);
    const deudaCuota = ficha_data.CUOTA * vencidas - ficha_data.TOTAL + ficha_data.CUOTA_ANT - ficha_data.CUOTA_PAGO;
    const pagas = Math.floor((ficha_data.TOTAL - ficha_data.SALDO) / ficha_data.CUOTA);
    const atraso = vencidas - pagas;
    const deuda_serv = ficha_data.SERVICIO_ANT - ficha_data.SERV_PAGO + atraso * ficha_data.SERV_UNIT;
    const deuda_mora = ficha_data.MORA_ANT - ficha_data.MORA_PAGO + atraso * ficha_data.CUOTA * 0.1;
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








