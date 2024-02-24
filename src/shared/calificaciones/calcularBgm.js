const { round } = require("../../lib/numbers.js");
const { LIMITANTES } = require("./constants/limitantes.js");
const { INICIALES } = require("./constants/nuevos.js");
const { calcularIncremento } = require("./lib/auxiliares.js");






const calcularDisponible = (ZFinal, BaseDetalleSummary) => {
    const { MAXIMO_TOMADO, MINIMO_TOMADO, PROMEDIO_TOMADO, CREDITOS_BGM } = BaseDetalleSummary;

    //Borrar, ya debera de haber evaluado que sea nuevo
    if (CREDITOS_BGM == 0) return 1

    //SI PAGO BIEN, COMO MINIMO 1 SABANA
    if (ZFinal <= 0.25)
        return MAXIMO_TOMADO <= 1 ? Math.max(1, MAXIMO_TOMADO, PROMEDIO_TOMADO) : MAXIMO_TOMADO

    if (ZFinal <= 0.5)
        return PROMEDIO_TOMADO

    //1 MAL -> 1 ¿SABANA C/A?
    if (ZFinal <= 0.8)
        return Math.min(1, PROMEDIO_TOMADO)

    //UN CLIENTE ENTRE 0.8 Y 1, NO PUEDE TENER MAS DEL 0,5 DISPONIBLE

    // if (Z <= 1)
    return Math.min(0.5, MINIMO_TOMADO)

}

const calcularLimitante = (fichasVigentes, cteData, cantidadComprasCanceladas, cantidadDeCompras, BaseDetalle) => {
    if (cteData.ES_CLAVO) return "CLAVAZO"

    const estaAtrasado = !!fichasVigentes.find(ficha => ficha.atraso_evaluado > 0);
    if (estaAtrasado) return "ATRASADO"

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

const calcularCalificacion = (ZFinal, limitante, disponible) => {
    if (limitante == "CLAVAZO") return "CLAVAZO"
    if (limitante == "DEVOLUCIONES") return "NO VENDER"
    if (ZFinal <= 0.25) return disponible + " Muy Bien"
    if (ZFinal <= 0.5) return disponible + " Bien"
    if (ZFinal <= 0.8) return disponible + " Mal"
    return disponible + " NO VENDER"
}

const calcularCalificacionCteNuevo = (limitante) => {
    if (limitante && limitante != "ATRASADO") return calcularCalificacion(0, limitante, 0)
    return INICIALES.CALIFICACION
}

const calcularDisponibleFinal = (limiteBgm, limiteEasy, tomadoFichasBGM, tomadoPrestamosBGM) => {


    const limiteEasyBGM = round(limiteEasy / 12000, 2)
    const vuAdicionalesPorEasyCash = Math.max(tomadoPrestamosBGM > 0 ? limiteEasyBGM - tomadoPrestamosBGM : 0, 0)
    return round(Math.max(limiteBgm - tomadoFichasBGM + vuAdicionalesPorEasyCash, 0), 1)
}


const calcularMasterBgm = ({ cteData, fichasVigentes, BaseDetalleResumen, BaseDetalleBgm, promedioDiasDeAtraso, fichasVigentesBgm, tomadoPrestamosBGM, tomadoFichasBGM, ZFinal, limiteEasy }) => {

    /*No hay nada que evaluar en bgm*/
    // if (!BaseDetalleBgm.length && !fichasVigentesBgm.length) return cteNuevoBgm

    /*Clientes nuevos */
    if (!BaseDetalleBgm.length) {
        const disponible = INICIALES.BGM - tomadoFichasBGM - tomadoPrestamosBGM;
        const incremento = 0;
        const limitante = calcularLimitante(fichasVigentes, cteData, BaseDetalleResumen.DEVOLUCIONES + BaseDetalleResumen.RETIRADAS, BaseDetalleResumen.CREDITOS_BGM, BaseDetalleBgm)

        const limite = calcularLimite(limitante, disponible, incremento)

        const calificacion = calcularCalificacionCteNuevo(limitante)

        const disponibleFinal = calcularDisponibleFinal(limite, limiteEasy, tomadoFichasBGM, tomadoPrestamosBGM)

        return { disponible, incremento, limitante, limite, disponibleFinal, calificacion }
    }


    /*Genera la calificacion del cliente */
    const disponible = calcularDisponible(ZFinal, BaseDetalleResumen)


    const incremento = calcularIncremento(ZFinal, BaseDetalleBgm, promedioDiasDeAtraso, { NUEVAS: BaseDetalleResumen.NUEVAS, FICHAS: BaseDetalleResumen.CREDITOS_BGM })

    //Ver si se puede sacar afuera de la funcion
    const limitante = calcularLimitante(fichasVigentes, cteData, BaseDetalleResumen.DEVOLUCIONES + BaseDetalleResumen.RETIRADAS, BaseDetalleResumen.CREDITOS_BGM, BaseDetalleBgm)


    const limite = calcularLimite(limitante, disponible, incremento)


    const disponibleFinal = calcularDisponibleFinal(limite, limiteEasy, tomadoFichasBGM, tomadoPrestamosBGM)

    const calificacion = calcularCalificacion(ZFinal, limitante, disponible)


    return {
        disponible, incremento, limitante, limite, disponibleFinal, calificacion
    }
}






module.exports = { calcularMasterBgm }