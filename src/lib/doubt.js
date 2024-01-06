const { getVencidas, getToday, sumarMeses, dateDiff } = require("../lib/dates");
const DAY = 1000 * 60 * 60 * 24;
const { ZONAS_EXCEPCIONES } = require("../constants/zonas_excepciones.js");


const getVencimientoValido = ({ VENCIMIENTO, PRIMER_PAGO }) => {
    const HOY = new Date(getToday());

    let EsPrimerPago = false;
    let VENCIMIENTO_EVALUA;
    if (Math.max(HOY - DAY, new Date(VENCIMIENTO), new Date(PRIMER_PAGO)) == HOY.getTime() - DAY) {
        VENCIMIENTO_EVALUA = VENCIMIENTO;
    } else {
        EsPrimerPago = true;
        VENCIMIENTO_EVALUA = PRIMER_PAGO;
    }

    return { EsPrimerPago, VENCIMIENTO_EVALUA }
}

const getAtrasos = ({ VENCIMIENTO_EVALUA, CUOTAS, TOTAL, SALDO, CUOTA }) => {

    const vencidas = getVencidas(new Date(VENCIMIENTO_EVALUA), new Date(getToday()), CUOTAS);


    const pagas =
        Math.max(
            Math.trunc((TOTAL - SALDO) / CUOTA * 10) / 10,
            0);

    const atraso = parseFloat(Math.max(vencidas - pagas, 0).toFixed(1));
    const atraso_eval = Math.max(Math.ceil(vencidas - (pagas + 0.3)), 0);


    return { vencidas, pagas, atraso, atraso_eval }

}


const getAtrasosEasyCash = ({ VENCIMIENTO_EVALUA, CUOTAS, TOTAL, SALDO, CUOTA }) => {

    const vencidas = getVencidas(new Date(VENCIMIENTO_EVALUA), new Date(getToday()), CUOTAS);


    const pagas =
        Math.max(
            Math.trunc((TOTAL - SALDO) / CUOTA * 100) / 100,
            0);

    const atraso = parseFloat(Math.max(vencidas - pagas, 0).toFixed(1));
    const atraso_eval = Math.max(Math.ceil(vencidas - (pagas + 0.05)), 0);


    return { vencidas, pagas, atraso, atraso_eval }

}


function getDebtEasy({ VENCIMIENTO, PRIMER_PAGO, CUOTAS, CUOTA, TOTAL, CUOTA_ANT, CUOTA_PAGO, SALDO,
    SERVICIO_ANT, SERV_PAGO, SERV_UNIT, MORA_ANT, MORA_PAGO, Z, ARTICULOS: CAPITAL, ATRASO, VENCIDAS, CAMBIOS_DE_FECHA_EXACTO, SERVICIO_HOY }, COBRADOR = false) {

    let { vencidas, pagas, atraso,atraso_eval } = getAtrasosEasyCash({ CUOTA, CUOTAS, SALDO, TOTAL, VENCIMIENTO_EVALUA: VENCIMIENTO });


    const cuota = Math.max(CUOTA * vencidas - TOTAL + CUOTA_ANT - CUOTA_PAGO, 0);

    const mora_unit = Math.max(Math.round(CAPITAL * 0.01 / 100) * 100, 150);

    const vencimiento_vigente = sumarMeses(new Date(VENCIMIENTO), Math.floor(pagas)).toISOString().split("T")[0];

    const mora = atraso_eval <= 0 ? 0 : Math.max(mora_unit * dateDiff(getToday(), vencimiento_vigente) + MORA_ANT - MORA_PAGO, 0);

    const servicio =
        Math.max(
            Math.min(CAMBIOS_DE_FECHA_EXACTO * 1000 + (!SERVICIO_HOY && COBRADOR ? 1000 : 0), 5000) + SERVICIO_ANT - SERV_PAGO
            , 0);

    atraso_eval = (atraso_eval == 0 && SALDO > 0 && vencidas == TOTAL / CUOTA) ? 1 : atraso_eval;

    return {
        cuota,
        servicio,
        vencidas,
        mora,
        atraso,
        atraso_evaluado : atraso_eval,
        pagas, vencimiento_vigente, EsPrimerPago: false
    }
}

function getDoubt({ VENCIMIENTO, PRIMER_PAGO, CUOTAS, CUOTA, TOTAL, CUOTA_ANT, CUOTA_PAGO, SALDO,
    SERVICIO_ANT, SERV_PAGO, SERV_UNIT, MORA_ANT, MORA_PAGO, Z, FICHA }, COBRADOR = false, Easy = false) {


    //AGREGAR ALGORITMO PARA COBRADOR

    const { VENCIMIENTO_EVALUA, EsPrimerPago } = getVencimientoValido({ VENCIMIENTO, PRIMER_PAGO });
    let { vencidas, pagas, atraso, atraso_eval } = getAtrasos({ CUOTA, CUOTAS, SALDO, TOTAL, VENCIMIENTO_EVALUA });

    //Deuda
    const deudaCuota = Math.max(CUOTA * vencidas - TOTAL + CUOTA_ANT - CUOTA_PAGO, 0);
    const deuda_mora = Math.floor(Math.max(MORA_ANT - MORA_PAGO + Math.max(atraso_eval - 1, 0) * CUOTA * 0.1, 0) / 100) * 100;



    //Si no le vencio este mes, agrega 1 servicio ( Esto despues de calcular la mora Q)
    // let deuda_serv = FECHA_VENTA < '2022-12-01' ? 0 : Math.max(SERVICIO_ANT - SERV_PAGO + atraso_eval * SERV_UNIT, 0);
    let deuda_serv = Math.max(SERVICIO_ANT - SERV_PAGO + Math.min(atraso_eval, 2) * SERV_UNIT, 0);


    if (vencidas < CUOTAS && COBRADOR &&
        getToday() <= `${VENCIMIENTO_EVALUA.split("-")[0]}-${getToday().split("-")[1]}-${VENCIMIENTO_EVALUA.split("-")[2]}`
        && !ZONAS_EXCEPCIONES.includes(Z) && !deuda_serv > 0
    ) {
        // deuda_serv = FECHA_VENTA < '2022-12-01' ? 0 : Math.max(SERVICIO_ANT - SERV_PAGO + atraso_eval * SERV_UNIT, 0);
        deuda_serv = Math.max(SERVICIO_ANT - SERV_PAGO + Math.min((atraso_eval + 1), 2) * SERV_UNIT, 0);

    }




    //Si el cliente esta atrasado, el servicio ADICIONAL, Existe Si solo si la cuota de este mes no paga servicio

    const VENCIMIENTO_DATE = new Date(VENCIMIENTO);
    const vencimiento_vigente = new Date(VENCIMIENTO_DATE.getUTCFullYear(), VENCIMIENTO_DATE.getUTCMonth() + pagas, VENCIMIENTO_DATE.getUTCDate()).toISOString().split("T")[0];

    //Si la ficha esta en las zonas de excepciones, la pone para cobrar
    const date_diff = dateDiff(getToday(), vencimiento_vigente);
    atraso_eval =
        ((atraso_eval == 0) && ZONAS_EXCEPCIONES.includes(Z) && SALDO > 0 && -2 <= date_diff && date_diff <= 0)
            ||
            (atraso_eval == 0 && SALDO > 0 && vencidas == TOTAL / CUOTA) ? 1 : atraso_eval;





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

module.exports = { getDoubt, getAtrasos, getVencimientoValido, getDebtEasy }

