const { formatBaseDetalle } = require("./formaters/BaseDetalleBGMFormatter")
const { formatPagosAcumulados } = require("./formaters/PagosBGMFormater")
const { getEvaluationData } = require("./getEvaluationData")
const { generateSummaryBaseDetalle } = require("./summary")
const { round } = require("../../lib/numbers.js")
const { calcularIncremento } = require("./calculosAuxiliares.js")
const { getCliente } = require("../model/cteData.js")
const { getFichasVigentes } = require("./fichasVigentes.js")
const { LIMITANTES } = require("../constants/limitantes.js")

const calcularZFinal = (cantidadDeCreditos, pagos) => {
    const sumaPromedios = pagos.reduce((acum, pagos) => acum + pagos.variableAtraso, 0)
    console.log(sumaPromedios);
    return sumaPromedios / cantidadDeCreditos
}

const calcularDisponible = (Z, BaseDetalleSummary) => {
    const { MAXIMO_TOMADO, PROMEDIO_TOMADO, MINIMO_TOMADO } = BaseDetalleSummary
    if (Z <= 0.25) return Math.max(MAXIMO_TOMADO, PROMEDIO_TOMADO)
    if (Z <= 0.5) return PROMEDIO_TOMADO
    if (Z <= 1) return MINIMO_TOMADO
}
const calcularLimitante = (fichasVigentes, cteData, BaseDetalle) => {
    if (cteData.ES_CLAVO) return "CLAVAZO"
    const estaAtrasado = !!fichasVigentes.find(ficha => ficha.atraso_evaluado > 0);
    if (estaAtrasado) return "ATRASADO"
    const perdida = BaseDetalle.find(ficha => ficha.ESTADO == "PERDIDA")
    if(perdida) return "PERDIDA"

    const ultEstado = BaseDetalle[0].ESTADO
    const anteUltEstado = BaseDetalle[1]?.ESTADO
    if(ultEstado == "REFI" || anteUltEstado == "REFI") return "REFI"

    return null
}
const calcularLimite = (limitante, disponible, incremento,MAXIMO_TOMADO) => {
    if (limitante) return LIMITANTES[limitante];
    return round(Math.min( Math.max(disponible + (incremento * 10000), 0),Math.max(MAXIMO_TOMADO * 2,15000)), 2)

}

const calcularFinalBGM = () => {

}
const initEasy = async (CTE) => {
    console.log("consulta");
    const { BaseDetalle, pagos } = await getEvaluationData(CTE, formatBaseDetalle, formatPagosAcumulados, true);
    const BaseDetalleSummary = generateSummaryBaseDetalle(BaseDetalle, true);
    // console.log("Base detalle",BaseDetalle);

    console.log("pagos");
    console.log(pagos);

    console.log("Resumen basedetalle");
    console.log(BaseDetalleSummary);

    console.log("ZFinal");
    const ZFinal = round(calcularZFinal(BaseDetalleSummary.FICHAS, pagos), 2)
    console.log(ZFinal);

    console.log("Disponible");
    const disponible = calcularDisponible(ZFinal, BaseDetalleSummary)
    console.log(disponible);

    console.log("Promedio dias de atraso");
    const promedioDiasDeAtraso = pagos.length > 0 ? pagos.reduce((acum, pago) => acum + pago.diasDeAtraso, 0) / pagos.length : 0;
    console.log(promedioDiasDeAtraso);


    console.log("Incremento");
    const incremento = calcularIncremento(ZFinal, BaseDetalle, promedioDiasDeAtraso, BaseDetalleSummary, [5, 10])
    console.log(incremento);

    console.log("Datos del cliente");
    const [cteData] = await getCliente({ CTE });
    console.log(cteData);

    const fichasVigentes = await getFichasVigentes(CTE)

    console.log("LIMITANTE");
    const limitante = calcularLimitante(fichasVigentes, cteData, BaseDetalle)
    console.log(limitante);

    console.log("LIMITE");
    const limite = calcularLimite(limitante,disponible,incremento,BaseDetalleSummary.MAXIMO_TOMADO)
    console.log(limite);

}

initEasy(6239)

module.exports = { initEasy }










