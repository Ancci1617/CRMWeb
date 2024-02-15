const { formatBaseDetalle } = require("./formaters/BaseDetalleBGMFormatter")
const { formatPagosAcumulados } = require("./formaters/PagosBGMFormater")
const { getEvaluationData } = require("./getEvaluationData")
const { generateSummaryBaseDetalle } = require("./summary")
const { round } = require("../../lib/numbers.js")
const { calcularIncremento, calcularZFinal } = require("./calculosAuxiliares.js")
const { getCliente } = require("../model/cteData.js")
const { getFichasVigentes, splitPrestamosFichas } = require("./fichas.js")
const { LIMITANTES } = require("../constants/limitantes.js")
const { getCreditoDisponibleEasyClienteNuevo } = require("./clientesNuevos.js")




const calcularDisponible = (Z, BaseDetalleSummary) => {
    const { MAXIMO_TOMADO_CAPITAL, PROMEDIO_TOMADO_CAPITAL, MINIMO_TOMADO_CAPITAL } = BaseDetalleSummary

    if (Z <= 0.25) return Math.max(MAXIMO_TOMADO_CAPITAL, PROMEDIO_TOMADO_CAPITAL)
    if (Z <= 0.5) return PROMEDIO_TOMADO_CAPITAL
    return MINIMO_TOMADO_CAPITAL
}


const calcularLimitante = (fichasVigentes, cteData, BaseDetalle) => {
    if (cteData.ES_CLAVO) return "CLAVAZO"
    const estaAtrasado = !!fichasVigentes.find(ficha => ficha.atraso_evaluado > 0);
    if (estaAtrasado) return "ATRASADO"
    const perdida = BaseDetalle.find(ficha => ficha.ESTADO == "PERDIDA")
    if (perdida) return "PERDIDA"

    if (BaseDetalle.length > 0) {
        const ultEstado = BaseDetalle[0]?.ESTADO
        const anteUltEstado = BaseDetalle[1]?.ESTADO
        if (ultEstado == "REFI" || anteUltEstado == "REFI") return "REFI"
    }

    return null
}
const calcularLimite = (limitante, disponible, incremento, MAXIMO_TOMADO) => {
    if (limitante) return LIMITANTES[limitante] * 10000
    return round(Math.min(Math.max(disponible + (incremento * 10000), 0), Math.max(MAXIMO_TOMADO * 2, 15000)), 2)

}

/*Reemplazar con parametro CALCULADO DE la calificacion de bgm*/
const calcularDisponibleFinalEasy = (fichasVigentes, limite) => {
    const { prestamos, fichas } = splitPrestamosFichas(fichasVigentes);

    const tomadoPrestamosEasy = Math.max(prestamos.reduce((acum, prestamo) => acum + prestamo.capitalTomado, 0), 0)
    const tomadoFichasEasy = fichas.reduce((acum, ficha) => acum + ficha.VU, 0) * 12000

    return Math.round(Math.max(limite - tomadoPrestamosEasy - tomadoFichasEasy, 0))
}


const calcularClienteNuevo = (fichasVigentes, cteData) => {
    const limitante = calcularLimitante(fichasVigentes, cteData, [])
    const { prestamos, fichas } = splitPrestamosFichas(fichasVigentes)

    const tomadoPrestamosEasy = prestamos.reduce((acum, prestamo) => acum + prestamo.capitalTomado, 0)
    const tomadoFichasEasy = fichas.reduce((acum, ficha) => acum + ficha.VU, 0) * 12000

    const disponible = getCreditoDisponibleEasyClienteNuevo(limitante, tomadoFichasEasy, tomadoPrestamosEasy)
    return { limiteEasy: disponible, disponibleEasyCash : disponible, disponibleFinalEasy: disponible, ZFinalEasy: 0, incrementoEasy: 0 }

}

const getCreditoDisponibleEasy = async (CTE, BaseDetalleParam, pagosParam, CTE_DATA, fichasVigentesParam, ZFinalParam, promedioDiasDeAtrasoParam, BaseDetalleResumenParam) => {

    const { BaseDetalle, pagos } =
        (BaseDetalleParam && pagosParam) ?
            { BaseDetalle: BaseDetalleParam, pagos: pagosParam } :
            await getEvaluationData(CTE, formatBaseDetalle, formatPagosAcumulados, false);


    /* PUEDEN SER PARAMETROS */
    const fichasVigentes = fichasVigentesParam || await getFichasVigentes(CTE)
    const cteData = CTE_DATA || (await getCliente({ CTE }))[0];


    /*Si es cliente nuevo */
    if (BaseDetalle.length == 0) return { ...calcularClienteNuevo(fichasVigentes, cteData) }



    /* Parametros */
    const BaseDetalleSummary = BaseDetalleResumenParam || generateSummaryBaseDetalle(BaseDetalle);

    const ZFinal = ZFinalParam || round(calcularZFinal(0, 0, BaseDetalleSummary.VALIDAS, pagos, fichasVigentes.reduce((acum, prestamo) => acum + prestamo.ratioCreditoVencido, 0)), 2)

    const promedioDiasDeAtraso = promedioDiasDeAtrasoParam || pagos.reduce((acum, pago) => acum + pago.diasDeAtraso, 0) / pagos.length || 0



    /* CALCULO DE DISPONIBLES EASYCASH */
    const disponible = calcularDisponible(ZFinal, BaseDetalleSummary)

    const incremento = calcularIncremento(ZFinal, BaseDetalle, promedioDiasDeAtraso, BaseDetalleSummary)
    const limitante = calcularLimitante(fichasVigentes, cteData, BaseDetalle)

    const limite = calcularLimite(limitante, disponible, incremento, BaseDetalleSummary.MAXIMO_TOMADO_CAPITAL)

    const disponibleFinal = calcularDisponibleFinalEasy(fichasVigentes, limite)




    return {
        limiteEasy: limite,
        disponibleEasyCash: disponible,
        disponibleFinalEasy: disponibleFinal,
        ZFinal, ZFinalEasy: ZFinal,
        incrementoEasy: incremento, limitante, promedioDiasDeAtraso
    }
}

module.exports = { getCreditoDisponibleEasy, getCreditoDisponibleEasyClienteNuevo }










