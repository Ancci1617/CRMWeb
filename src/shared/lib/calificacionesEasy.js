const { formatBaseDetalle } = require("./formaters/BaseDetalleBGMFormatter")
const { formatPagosAcumulados } = require("./formaters/PagosBGMFormater")
const { getEvaluationData } = require("./getEvaluationData")
const { generateSummaryBaseDetalle } = require("./summary")
const { round } = require("../../lib/numbers.js")
const { calcularIncremento } = require("./calculosAuxiliares.js")
const { getCliente } = require("../model/cteData.js")
const { getFichasVigentes, splitPrestamosFichas } = require("./fichas.js")
const { LIMITANTES } = require("../constants/limitantes.js")

const calcularZFinal = (cantidadDeCreditos, pagos) => {
    const sumaPromedios = pagos.reduce((acum, pagos) => acum + pagos.variableAtraso, 0)
    // console.log(sumaPromedios);
    // console.log(cantidadDeCreditos);
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
    if (perdida) return "PERDIDA"

    if (BaseDetalle.length > 0) {
        const ultEstado = BaseDetalle[0].ESTADO
        const anteUltEstado = BaseDetalle[1]?.ESTADO
        if (ultEstado == "REFI" || anteUltEstado == "REFI") return "REFI"
    }

    return null
}
const calcularLimite = (limitante, disponible, incremento, MAXIMO_TOMADO) => {
    if (limitante) return LIMITANTES[limitante];
    return round(Math.min(Math.max(disponible + (incremento * 10000), 0), Math.max(MAXIMO_TOMADO * 2, 15000)), 2)

}

const calcularDisponibleFinalEasy = (fichasVigentes, limite) => {
    const { prestamos, fichas } = splitPrestamosFichas(fichasVigentes);

    const tomadoPrestamosEasy = prestamos.reduce((acum, prestamo) => acum + prestamo.capitalTomado, 0)
    const tomadoFichasEasy = fichas.reduce((acum, ficha) => acum + ficha.VU, 0) * 12000

    return Math.round(Math.max(limite - tomadoPrestamosEasy - tomadoFichasEasy, 0))
}
const getCreditoDisponibleEasy = async (CTE, BaseDetalleParam, pagosParam, CTE_DATA, fichasVigentesParam) => {
    const { BaseDetalle, pagos } =
        BaseDetalleParam && pagosParam ?
            { BaseDetalle: BaseDetalleParam, pagos: pagosParam } :
            await getEvaluationData(CTE, formatBaseDetalle, formatPagosAcumulados, true);

    //Si no tiene prestamos, retornar limite de cliente nuevo
    if (BaseDetalle.length == 0) return {
        limite: 10000, 
        disponibleFinal: 10000, 
        ZFinal: 0, 
        incremento: 0
    }

    // console.log(BaseDetalle);
    const BaseDetalleSummary = generateSummaryBaseDetalle(BaseDetalle, true);

    // console.log(BaseDetalleSummary);
    const ZFinal = round(calcularZFinal(BaseDetalleSummary.FICHAS - BaseDetalleSummary.DEVOLUCIONES - BaseDetalleSummary.RETIRADAS, pagos), 2)


    const disponible = calcularDisponible(ZFinal, BaseDetalleSummary)
    // console.log({disponibleEasy : disponible});

    const promedioDiasDeAtraso = pagos.length > 0 ? pagos.reduce((acum, pago) => acum + pago.diasDeAtraso, 0) / pagos.length : 0;
    // console.log({promedioDiasDeAtrasoEasy : promedioDiasDeAtraso});

    const incremento = calcularIncremento(ZFinal, BaseDetalle, promedioDiasDeAtraso, BaseDetalleSummary, [5, 10])
    // console.log({incrementoEasyCash:incremento});

    const cteData = CTE_DATA || (await getCliente({ CTE }))[0];


    const fichasVigentes = fichasVigentesParam || await getFichasVigentes(CTE)


    const limitante = calcularLimitante(fichasVigentes, cteData, BaseDetalle)

    const limite = calcularLimite(limitante, disponible, incremento, BaseDetalleSummary.MAXIMO_TOMADO)



    const disponibleFinal = calcularDisponibleFinalEasy(fichasVigentes, limite)

    return { limite, disponible, disponibleFinal, ZFinal, incremento }
}


module.exports = { getCreditoDisponibleEasy }










