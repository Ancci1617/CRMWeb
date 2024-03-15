const { getVencidas, getToday, sumarMeses, dateDiff } = require("../lib/dates");
const DAY = 1000 * 60 * 60 * 24;
const { ZONAS_EXCEPCIONES } = require("../constants/zonas_excepciones.js");
const { truncar } = require("./format.js");
const { round } = require("./numbers.js");

const getVencimientoValido = ({ VENCIMIENTO, PRIMER_PAGO, FECHA_EVALUAR }) => {
    const HOY = new Date(FECHA_EVALUAR || getToday());

    //Si las 2 cuotas estan vencidas, el valido se el vencimiento regular
    //SINO el vencimineto es el primer_pago
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




const getAtrasos = ({ VENCIMIENTO_EVALUA, CUOTAS, TOTAL, SALDO, CUOTA, ANTICIPO, FECHA_EVALUAR }) => {

    const vencidas = getVencidas(new Date(VENCIMIENTO_EVALUA), new Date(FECHA_EVALUAR || getToday()), CUOTAS);

    const saldoRestante = ANTICIPO ? TOTAL - SALDO - ANTICIPO : TOTAL - SALDO;
    const pagas = truncar(Math.max(
        saldoRestante / CUOTA + Number(!!ANTICIPO),
        0), 1);
    // const pagas = Math.max(
    //     Math.trunc((Number(!!ANTICIPO) + saldoRestante)  / CUOTA * 10) / 10,
    //     0);

    const atraso = parseFloat(Math.max(vencidas - pagas, 0).toFixed(1));
    const atraso_eval = Math.max(Math.ceil(vencidas - (pagas + 0.3)), 0);


    return { vencidas, pagas, atraso, atraso_eval }

}


const getAtrasosEasyCash = ({ VENCIMIENTO_EVALUA, CUOTAS, TOTAL, SALDO, CUOTA, FECHA_EVALUAR }) => {

    const vencidas = getVencidas(new Date(VENCIMIENTO_EVALUA), new Date(FECHA_EVALUAR || getToday()), CUOTAS);


    const pagas =
        Math.max(
            Math.trunc((TOTAL - SALDO) / CUOTA * 100) / 100,
            0);

    const atraso = parseFloat(Math.max(vencidas - pagas, 0).toFixed(1));
    const atraso_eval = Math.max(Math.ceil(vencidas - (pagas + 0.05)), 0);


    return { vencidas, pagas, atraso, atraso_eval }

}


function getDebtEasy({ VENCIMIENTO, CUOTAS, CUOTA, TOTAL, CUOTA_ANT, CUOTA_PAGO, SALDO,
    SERVICIO_ANT, SERV_PAGO, MORA_ANT, MORA_PAGO, Z, ARTICULOS: CAPITAL, CAMBIOS_DE_FECHA_EXACTO, SERVICIO_HOY }, COBRADOR = false, FECHA_EVALUAR) {

    let { vencidas, pagas, atraso, atraso_eval } = getAtrasosEasyCash({ CUOTA, CUOTAS, SALDO, TOTAL, VENCIMIENTO_EVALUA: VENCIMIENTO, FECHA_EVALUAR });


    const cuota = Math.max(CUOTA * vencidas - TOTAL + CUOTA_ANT - CUOTA_PAGO, 0);

    const capitalTomado = (SALDO / TOTAL) * CAPITAL
    const VALOR_UNITARIO = round(capitalTomado / 12000, 2)

    const mora_unit = Math.max(Math.round(CAPITAL * 0.01 / 100) * 100, 150);

    const vencimiento_vigente = sumarMeses(new Date(VENCIMIENTO), Math.floor(pagas)).toISOString().split("T")[0];

    const mora = atraso_eval <= 0 ? 0 : Math.max(mora_unit * dateDiff(FECHA_EVALUAR || getToday(), vencimiento_vigente) + MORA_ANT - MORA_PAGO, 0);

    const servicio =
        Math.max(
            Math.min(CAMBIOS_DE_FECHA_EXACTO * 1000 + (!SERVICIO_HOY && COBRADOR ? 1000 : 0), 5000) + SERVICIO_ANT - SERV_PAGO
            , 0);

    atraso_eval = (atraso_eval == 0 && SALDO > 0 && vencidas == TOTAL / CUOTA) ? 1 : atraso_eval;
    const ratioCreditoVencido = vencidas / CUOTAS


    return {
        cuota,
        servicio,
        vencidas,
        mora,
        atraso,
        atraso_evaluado: atraso_eval,
        pagas, vencimiento_vigente, EsPrimerPago: false, capitalTomado, VALOR_UNITARIO,
        ratioCreditoVencido

    }
}

//CALCULA LA DEUDA DE LA FICHA A DIA DE HOY, DONDE HOY = getToday()
function getDoubt({ VENCIMIENTO, PRIMER_PAGO, CUOTAS, CUOTA, TOTAL, CUOTA_ANT, CUOTA_PAGO, SALDO,
    SERVICIO_ANT, SERV_PAGO, SERV_UNIT, MORA_ANT, MORA_PAGO, Z, FICHA, ANTICIPO }, COBRADOR = false, FECHA_EVALUAR) {


    //Busca vencimiento valido, entre vencimiento o primer pago Y CALCULA los atrasos
    const { VENCIMIENTO_EVALUA, EsPrimerPago } = getVencimientoValido({ VENCIMIENTO, PRIMER_PAGO, FECHA_EVALUAR });
    let { vencidas, pagas, atraso, atraso_eval } = getAtrasos({ CUOTA, CUOTAS, SALDO, TOTAL, VENCIMIENTO_EVALUA, ANTICIPO, FECHA_EVALUAR });


    /*calcula al deuda en cuota,servicio y mora
    En caso que sea prepago calcula la deuda de cuota de la siguiente manera
    1er Cuota = ANTICIPO DEL PREPAGO DE 2DA a ultima cuota, algoritmo normal*/
    const deudaCuota =
        pagas < 1 && ANTICIPO ?
            Math.max(ANTICIPO - CUOTA_PAGO, 0) :
            Math.max(CUOTA * pagas - TOTAL + CUOTA_ANT - CUOTA_PAGO + (ANTICIPO ? ANTICIPO - CUOTA : 0), 0);



    const deuda_mora = Math.floor(Math.max(MORA_ANT - MORA_PAGO + Math.max(atraso_eval - 1, 0) * CUOTA * 0.1, 0) / 100) * 100;

    let deuda_serv = Math.max(SERVICIO_ANT - SERV_PAGO + Math.min(atraso_eval, 2) * SERV_UNIT, 0);

    //Vencimiento + meses * pagas = vencimiento vigente
    const VENCIMIENTO_DATE = new Date(VENCIMIENTO);
    const vencimiento_vigente = new Date(VENCIMIENTO_DATE.getUTCFullYear(), VENCIMIENTO_DATE.getUTCMonth() + pagas, VENCIMIENTO_DATE.getUTCDate()).toISOString().split("T")[0];


    //Si no vencio la cuota de este mes y es un cobrador el que consulta la deuda, agrega un servicio
    if (vencidas < CUOTAS && COBRADOR && getToday() <= vencimiento_vigente && !deuda_serv > 0
    ) {
        // deuda_serv = FECHA_VENTA < '2022-12-01' ? 0 : Math.max(SERVICIO_ANT - SERV_PAGO + atraso_eval * SERV_UNIT, 0);
        deuda_serv = Math.max(SERVICIO_ANT - SERV_PAGO + Math.min((atraso_eval + 1), 2) * SERV_UNIT, 0);

    }




    /*
    Si la ficha tiene todas las cuotas pagas(por redondeo) y todas la scuotas vencidas
    pero aun tiene un saldo pendiente, siempre va a estar para cobrar
    */

    atraso_eval = (atraso_eval == 0 && SALDO > 0 && vencidas == TOTAL / CUOTA) ? 1 : atraso_eval;
    const ratioCreditoVencido = vencidas / CUOTAS
    
    // console.log(     {
    //     cuota: deudaCuota,
    //     servicio: deuda_serv,
    //     vencidas,
    //     mora: deuda_mora,
    //     atraso,
    //     atraso_evaluado: atraso_eval,
    //     pagas, vencimiento_vigente, EsPrimerPago,
    //     ratioCreditoVencido,

    // });


    return {
        cuota: deudaCuota,
        servicio: deuda_serv,
        vencidas,
        mora: deuda_mora,
        atraso,
        atraso_evaluado: atraso_eval,
        pagas, vencimiento_vigente, EsPrimerPago,
        ratioCreditoVencido,

    }
}


module.exports = { getDoubt, getAtrasos, getVencimientoValido, getDebtEasy, getAtrasosEasyCash }

