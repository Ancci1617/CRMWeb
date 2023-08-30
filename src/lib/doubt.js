const { getVencidas, getToday, sumarMeses } = require("../lib/dates");
const DAY = 1000 * 60 * 60 * 24;

function getDoubt({ VENCIMIENTO, PRIMER_PAGO, CUOTAS, CUOTA, TOTAL, CUOTA_ANT, CUOTA_PAGO, SALDO,
    SERVICIO_ANT, SERV_PAGO, SERV_UNIT, MORA_ANT, MORA_PAGO, Z, FECHA_VENTA }, COBRADOR = false) {
    const HOY = new Date(getToday());

    let EsPrimerPago = false;
    let VENCIMIENTO_EVALUA;
    if (Math.max(HOY - DAY, new Date(VENCIMIENTO), new Date(PRIMER_PAGO)) == HOY.getTime() - DAY) {
        VENCIMIENTO_EVALUA = VENCIMIENTO;
    } else {
        EsPrimerPago = true;
        VENCIMIENTO_EVALUA = PRIMER_PAGO;
    }
    
    //AGREGAR ALGORITMO PARA COBRADOR
    const zonas_sin_servicio_cobranza = ["T3", "T4", "P1", "P2", "D6", "D7", "D8"];

    const vencidas = getVencidas(new Date(VENCIMIENTO_EVALUA), new Date(getToday()), CUOTAS);
    const deudaCuota = Math.max(CUOTA * vencidas - TOTAL + CUOTA_ANT - CUOTA_PAGO, 0);
    const pagas =
        Math.max(
            Math.trunc((TOTAL - SALDO) / CUOTA * 10) / 10,
            0);

    const atraso = parseFloat(Math.max(vencidas - pagas, 0).toFixed(1));

    let atraso_eval = Math.max(Math.ceil(vencidas - (pagas + 0.3)), 0);


    const deuda_mora = FECHA_VENTA < '2022-12-01' ? 0 : MORA_ANT - MORA_PAGO + Math.max(atraso_eval - 1, 0) * CUOTA * 0.1;

    //opcion 1, si esta al dia, agregale el servicio de este mes, SINO, DEJAR COMO ESTA (
    //En caso que pase esto, revisar el caso: (Esta atrasada, paga el serv del mes pasado, la cuota del mes pasado y la cuota de este mes, se le cobra el serv de este mes?)
    //)

    //opcion 2(vigente), siempre agregar el servicio de este mes 

    //Si no le vencio este mes, agrega 1 servicio ( Esto despues de calcular la mora Q)
    if (vencidas < CUOTAS && COBRADOR &&
        getToday() < `${VENCIMIENTO.split("-")[0]}-${getToday().split("-")[1]}-${VENCIMIENTO.split("-")[2]}`
        && !zonas_sin_servicio_cobranza.includes(Z)
    ) {
        atraso_eval = atraso_eval + 1;
    }



    const deuda_serv = FECHA_VENTA < '2022-12-01' ? 0 : Math.max(SERVICIO_ANT - SERV_PAGO + atraso_eval * SERV_UNIT, 0);
    console.log("VENCIMIENTO",VENCIMIENTO);
    const vencimiento_vigente = sumarMeses(new Date(VENCIMIENTO), Math.floor(pagas)).toISOString().split("T")[0];

    return {
        cuota: deudaCuota,
        servicio: deuda_serv,
        vencidas,
        mora: deuda_mora,
        atraso,
        atraso_evaluado: atraso_eval,
        pagas, vencimiento_vigente, EsPrimerPago
    }
}

module.exports = { getDoubt }






