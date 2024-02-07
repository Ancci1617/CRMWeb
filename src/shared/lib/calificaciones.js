
const { getCliente } = require("../model/cteData.js");
const { getDoubt, getDebtEasy } = require("../../lib/doubt.js");
const { FichasViejas } = require("../constants/dates.js");
const { generateSummaryBaseDetalle } = require("./summary.js");
const { round } = require("../../lib/numbers.js");
const { getFichasOptimized } = require("../../model/CRM/get_tablas/get_fichas.js");
const { LIMITANTES } = require("../constants/limitantes.js");
const { getEvaluationData } = require("./getEvaluationData.js");
const { formatPagosAcumulados } = require("./formaters/PagosBGMFormater.js");
const { formatBaseDetalle } = require("./formaters/BaseDetalleBGMFormatter.js");
const { getFichasVigentes } = require("./fichasVigentes.js");

//Obtiene el Z inciial de la logica de las ventas < 2023
const getZInicial = (cteSummary) => {

    const { PROMEDIO, MINIMO, MAXIMO } = cteSummary;
    if (PROMEDIO < 7 && MINIMO < 7 && MAXIMO < 7.1) return 0.15
    if (PROMEDIO < 7.1 && MINIMO < 7.1 && MAXIMO < 8) return 0.4
    if (PROMEDIO < 9.1 && MINIMO < 8.1 && MAXIMO < 12) return 0.7
    return 1

}













//codigo = concatenado de : N°CTE - N°FICHA
//A los pagos recibidos les agrega:
/*PAGADO_ANT,VencimientoValido,Pagas,VencimientoVigente,DIAS_ATRASO,Atraso_evaluado,VARIABLE_ATRASO*/




const calcularZFinal = (ZInicial, masterSummaryAnt, masterSummary, pagos) => {
    const promAnt = ZInicial * masterSummaryAnt.FICHAS
    const sumPromedios = promAnt + pagos.reduce((acum, pago) => acum + pago.variableAtraso, 0)
    return sumPromedios / (masterSummary.FICHAS - masterSummary.DEVOLUCIONES - masterSummary.RETIRADAS)
}




//Calculo del disponible base (sin tomar en cuenta atrasos,y limites)
const calcularDisponile = (Z, BaseDetalleSummary,Unidad = 1) => {
    const { MAXIMO_TOMADO, MINIMO_TOMADO, PROMEDIO_TOMADO } = BaseDetalleSummary;

    //SI PAGO BIEN, COMO MINIMO 1 SABANA
    if (Z <= 0.25)
        return MAXIMO_TOMADO <= Unidad ? Math.max(1, MAXIMO_TOMADO, PROMEDIO_TOMADO) : MAXIMO_TOMADO


    if (Z <= 0.5)
        return PROMEDIO_TOMADO

    //1 MAL -> 1 ¿SABANA C/A?
    if (Z <= 0.8)
        return  Unidad

    //UN CLIENTE ENTRE 0.8 Y 1, NO PUEDE TENER MAS DEL 0,5 DISPONIBLE
    if (Z <= 1)
        return Math.min(0.5, MINIMO_TOMADO)

}



/*
LIMITANTE AFECTA AL LIMITE DE CREDITO
*/
const calcularLimitante = (fichasVigentes, cteData, cantidadComprasCanceladas, cantidadDeCompras, BaseDetalle) => {
    const estaAtrasado = !!fichasVigentes.find(ficha => ficha.atraso_evaluado > 0);
    if (estaAtrasado) return "ATRASADO"
    if (cteData.ES_CLAVO) return "CLAVAZO"
    if (cantidadComprasCanceladas / cantidadDeCompras >= 0.5) return "DEVOLUCIONES"

    const ultEstado = BaseDetalle[0].ESTADO
    const anteUltEstado = BaseDetalle[1]?.ESTADO
    if (ultEstado == "RETIRADO" || anteUltEstado == "RETIRADO") return "RETIRADAS"

    return null
}

const calcularLimite = (limitante, disponible, incremento) => {
    if (limitante) return LIMITANTES[limitante];
    return round(Math.min(Math.max(disponible + incremento, 0), 7), 2)

}

async function init() {
    const CTE = 23647;
    /* const RawBaseDetalle = await getBaseDetalle({ CTE })
     console.log("Base detalle")
     console.log(RawBaseDetalle)

     console.log("Pagos acumulados")
     const pagosAcumulados = await getPagosAcumulados({ CTE })
     console.log(pagosAcumulados)

     console.log("Pagos formateados")
     const pagos = formatPagosAcumulados(pagosAcumulados)
     console.log(pagos)


     console.log("formated base detall");
     const BaseDetalle = formatBaseDetalle(RawBaseDetalle, pagos);
     console.log(BaseDetalle);*/

    const { BaseDetalle, pagos } = await getEvaluationData(CTE, formatBaseDetalle, formatPagosAcumulados);
    console.log(BaseDetalle, pagos);

    console.log("Resumen compras viejas")
    const summaryAnt = generateSummaryBaseDetalle(BaseDetalle.filter(ficha => ficha.FECHA < FichasViejas));
    console.log(summaryAnt)

    console.log("Calcula el Z")
    const ZInicial = round(getZInicial(summaryAnt), 2)
    console.log(ZInicial)



    console.log("Resumen todas las compras")
    const summary = generateSummaryBaseDetalle(BaseDetalle)
    console.log(summary)

    console.log("ZFinal")
    const ZFinal = round(calcularZFinal(ZInicial, summaryAnt, summary, pagos), 2)
    console.log(ZFinal)

    //Empieza a generar el BGMDisponibleFinal
    console.log("Promedio dias de atraso");
    const promedioDiasDeAtraso = pagos.length > 0 ? pagos.reduce((acum, pago) => acum + pago.diasDeAtraso, 0) / pagos.length : 0;
    console.log(promedioDiasDeAtraso);


    console.log("maximo, bien pagado,minimo,promedio");
    const disponible = calcularDisponile(ZFinal, summary)
    console.log(disponible);

    console.log("INCREMENTO");
    const incremento = calcularIncremento(ZFinal, BaseDetalle, promedioDiasDeAtraso, { NUEVAS: summary.NUEVAS, FICHAS: summary.FICHAS })
    console.log(incremento);

    console.log("Fichas");
    const fichasVigentes = await getFichasVigentes(CTE);
    console.log(fichasVigentes);



    console.log("Datos del cliente");
    const [cteData] = await getCliente({ CTE });
    console.log(cteData);

    // Calcular limitante
    console.log("limitante");
    const limitante = calcularLimitante(fichasVigentes, cteData, summary.DEVOLUCION + summary.RETIRADAS, summary.FICHAS, BaseDetalle)
    console.log(limitante);

    //Calcular LIMITE
    console.log("LIMITE");
    const limite = calcularLimite(limitante, disponible, incremento)
    console.log(limite);


    console.log("tomado bgm");
    const tomadoBgm = fichasVigentes.reduce((acum, ficha) => acum + ficha.VU, 0)
    console.log(tomadoBgm);



}
// init()







module.exports = { getZInicial }









