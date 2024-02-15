
const { getCliente } = require("../model/cteData.js");
const { FichasViejas } = require("../constants/dates.js");
const { generateSummaryBaseDetalle } = require("./summary.js");
const { round } = require("../../lib/numbers.js");
const { LIMITANTES, INICIALES } = require("../constants/limitantes.js");
const { getEvaluationData } = require("./getEvaluationData.js");
const { formatPagosAcumulados } = require("./formaters/PagosBGMFormater.js");
const { formatBaseDetalle } = require("./formaters/BaseDetalleBGMFormatter.js");
const { getFichasVigentes, splitPrestamosFichas } = require("./fichas.js");
const { calcularIncremento, calcularTomado, calcularZFinal } = require("./calculosAuxiliares.js");
const { getCreditoDisponibleEasy, getCreditoDisponibleEasyClienteNuevo } = require("./calificacionesEasy.js");
const { getCreditoDisponibleBgmClienteNuevo } = require("./clientesNuevos.js");
const { cteNuevoBgmObject } = require("../constants/nuevos.js");
//Obtiene el Z inciial de la logica de las ventas < 2023
const getZInicial = (cteSummary) => {

    const { PROMEDIO, MINIMO, MAXIMO } = cteSummary;
    if (PROMEDIO < 7 && MINIMO < 7 && MAXIMO < 7.1) return 0.15
    if (PROMEDIO < 7.1 && MINIMO < 7.1 && MAXIMO < 8) return 0.4
    if (PROMEDIO < 9.1 && MINIMO < 8.1 && MAXIMO < 12) return 0.55
    return 0.7

}








//Calculo del disponible base (sin tomar en cuenta atrasos,y limites)
const calcularDisponile = (Z, BaseDetalleSummary, Unidad = 1) => {
    const { MAXIMO_TOMADO, MINIMO_TOMADO, PROMEDIO_TOMADO, CREDITOS_BGM } = BaseDetalleSummary;

    if (CREDITOS_BGM == 0) return Unidad

    //SI PAGO BIEN, COMO MINIMO 1 SABANA
    if (Z <= 0.25)
        return MAXIMO_TOMADO <= Unidad ? Math.max(1, MAXIMO_TOMADO, PROMEDIO_TOMADO) : MAXIMO_TOMADO

    if (Z <= 0.5)
        return PROMEDIO_TOMADO

    //1 MAL -> 1 ¿SABANA C/A?
    if (Z <= 0.8)
        return Math.min(Unidad,PROMEDIO_TOMADO)

    //UN CLIENTE ENTRE 0.8 Y 1, NO PUEDE TENER MAS DEL 0,5 DISPONIBLE

    // if (Z <= 1)
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
    if (BaseDetalle.length > 0) {
        const ultEstado = BaseDetalle[0].ESTADO
        const anteUltEstado = BaseDetalle[1]?.ESTADO
        if (ultEstado == "RETIRADO" || anteUltEstado == "RETIRADO") return "RETIRADAS"
    }

    return null
}

const calcularLimite = (limitante, disponible, incremento) => {
    if (limitante) return LIMITANTES[limitante];
    return round(Math.min(Math.max(disponible + incremento, 0), 7), 2)

}

const calcularDisponibleFinalBgm = (limiteBgm, limiteEasy, tomadoFichasBGM, tomadoPrestamosBGM) => {


    const limiteEasyBGM = round(limiteEasy / 12000, 2)
    const vuAdicionalesPorEasyCash = Math.max(tomadoPrestamosBGM > 0 ? limiteEasyBGM - tomadoPrestamosBGM : 0,0)
    return Math.max(limiteBgm - tomadoFichasBGM + vuAdicionalesPorEasyCash, 0)
}

const calcularCalificacion = (ZFinal, limitante, disponible) => {
    if (limitante == "CLAVAZO") return "CLAVAZO"
    if (limitante == "DEVOLUCIONES") return "NO VENDER"
    if (ZFinal <= 0.25) return disponible + " Muy Bien"
    if (ZFinal <= 0.5) return disponible + " Bien"
    if (ZFinal <= 0.8) return disponible + " Mal"
    return disponible + " NO VENDER"
}

const calcularCLienteNuevo = (fichasVigentes, cteData, tomadoFichasBGM, tomadoFichasEasy, tomadoPrestamosBGM, tomadoPrestamosEasy) => {
    const limitante = calcularLimitante(fichasVigentes, cteData, 0, 0, [])
    const disponibleBgm = getCreditoDisponibleBgmClienteNuevo(limitante, tomadoFichasBGM, tomadoPrestamosBGM)
    const disponibleEasy = getCreditoDisponibleEasyClienteNuevo(limitante, tomadoFichasEasy, tomadoPrestamosEasy)


    return {
        ZInicial: 0,
        ZFinal: 0,
        ZFinalEasy: 0,
        ComprasViejas: 0,
        ComprasNuevas: 0,
        promedioDiasDeAtraso: 0,
        MAXIMO_TOMADO: 0,
        PROMEDIO_TOMADO: 0,
        MINIMO_TOMADO: 0,
        limitante,
        incremento: 0,
        incrementoEasy: 0,
        tomadoFichasBGM,
        tomadoPrestamosEasy,
        tomadoPrestamosBGM,
        calificacion: "Nuevo",
        limite: disponibleBgm,
        limiteEasy: disponibleEasy,
        disponible: disponibleBgm,
        disponibleEasyCash: disponibleEasy,
        disponibleFinalEasy: disponibleEasy,
        disponibleFinalBgm: disponibleBgm,
    }
}


async function getCreditoDisponibleBgm(CTE, BaseDetalleParam, pagosParam, cteDataParam, fichasVigentesParam) {

    /*FETCH DATA (PUEDEN SER PARAMETROS) */
    const [cteData] = cteDataParam || await getCliente({ CTE })

    if (!cteData) throw new Error(`El cliente ${CTE} no existe`)

    const fichasVigentesFull = fichasVigentesParam || await getFichasVigentes(CTE)

    const { BaseDetalle: BaseDetalleFull, pagos: pagosFull } = (BaseDetalleParam && pagosParam) ?
        { BaseDetalle: BaseDetalleParam, pagos: pagosParam } : await getEvaluationData(CTE, formatBaseDetalle, formatPagosAcumulados)


    const { prestamos: BaseDetalleEasy, fichas: BaseDetalle } = splitPrestamosFichas(BaseDetalleFull)


    const { tomadoFichasBGM, tomadoPrestamosEasy, tomadoPrestamosBGM, tomadoFichasEasy } = calcularTomado(fichasVigentesFull)

    const summary = generateSummaryBaseDetalle(BaseDetalleFull)
    const limitante = calcularLimitante(fichasVigentesFull, cteData, summary.DEVOLUCIONES + summary.RETIRADAS, summary.CREDITOS_BGM, BaseDetalle)



    /*Si no tuvo nada, calcularClientesNuevos
    Si tuvo fichas y no tuvo prestamos, normal
    si tuvo prestamos pero no fichas calcular EasyCash + objeto vacio de BGM*/

    /*NUEVOS */
    if (!BaseDetalleFull.length) return { ...{ CTE }, ...calcularCLienteNuevo(fichasVigentesFull, cteData, tomadoFichasBGM, tomadoFichasEasy, tomadoPrestamosBGM, tomadoPrestamosEasy) }
    if (BaseDetalleEasy.length && !BaseDetalle.length) {
        const disponibleEasyCash = await getCreditoDisponibleEasy(CTE, BaseDetalleEasy, pagosFull, cteData, fichasVigentesFull, null, null, summary);
        return {
            ...cteNuevoBgmObject,
            ...disponibleEasyCash,
            ...{ tomadoFichasBGM, tomadoFichasEasy, tomadoPrestamosBGM, tomadoPrestamosEasy },
            ...{ disponibleFinalBgm: getCreditoDisponibleBgmClienteNuevo(limitante,tomadoFichasBGM,tomadoPrestamosBGM) }
        }
    }



    /* CALCULOS */

    const BaseDetalleAnt = BaseDetalle.filter(ficha => ficha.FECHA < FichasViejas)
    const summaryAnt = generateSummaryBaseDetalle(BaseDetalleAnt)
    const ZInicial = BaseDetalleAnt.length ? round(getZInicial(summaryAnt), 2) : 0


    const ZFinal = round(calcularZFinal(ZInicial, summaryAnt.VALIDAS, summary.CREDITOS_BGM, pagosFull, fichasVigentesFull.reduce((acum, ficha) => acum + ficha.ratioCreditoVencido, 0)), 2)

    const promedioDiasDeAtraso = pagosFull.reduce((acum, pago) => acum + pago.diasDeAtraso, 0) / pagosFull.length || 0

    const disponible = calcularDisponile(ZFinal, summary)

    const incremento = calcularIncremento(ZFinal, BaseDetalle, promedioDiasDeAtraso, { NUEVAS: summary.NUEVAS, FICHAS: summary.CREDITOS_BGM })




    const limite = calcularLimite(limitante, disponible, incremento)

    const { limiteEasy,
        disponibleFinalEasy,
        ZFinalEasy,
        disponibleEasyCash,
        incrementoEasy } =
        await getCreditoDisponibleEasy(CTE, BaseDetalleEasy, pagosFull, cteData, fichasVigentesFull, ZFinal, promedioDiasDeAtraso, summary);
    const disponibleFinalBgm = round(calcularDisponibleFinalBgm(limite, limiteEasy, tomadoFichasBGM, tomadoPrestamosBGM), 1)

    const calificacion = calcularCalificacion(ZFinal, limitante, disponible)

    return {
        CTE,
        ZInicial,
        ZFinal,
        ZFinalEasy,
        ComprasViejas: summary.VIEJAS,
        ComprasNuevas: summary.NUEVAS,
        promedioDiasDeAtraso,
        MAXIMO_TOMADO: summary.MAXIMO_TOMADO,
        PROMEDIO_TOMADO: summary.PROMEDIO_TOMADO,
        MINIMO_TOMADO: summary.MINIMO_TOMADO,
        disponible,
        limitante,
        limite,
        incremento,
        incrementoEasy,
        limiteEasy,
        tomadoFichasBGM,
        tomadoPrestamosEasy,
        tomadoPrestamosBGM,
        disponibleEasyCash,
        disponibleFinalEasy,
        disponibleFinalBgm,
        calificacion,
    }


}

getCreditoDisponibleBgm(26035).then(res => console.log(res))






module.exports = { getCreditoDisponibleBgm }









