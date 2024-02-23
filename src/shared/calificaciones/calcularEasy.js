const { round } = require("../../lib/numbers.js")
const { LIMITANTES } = require("./constants/limitantes.js")
const { INICIALES } = require("./constants/nuevos.js")
const {  calcularIncremento } = require("./lib/auxiliares.js")

const calcularDisponible = (Z, BaseDetalleResumen) => {
    const { MAXIMO_TOMADO_CAPITAL, PROMEDIO_TOMADO_CAPITAL, MINIMO_TOMADO_CAPITAL } = BaseDetalleResumen

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
        const ultEstado = BaseDetalle[0].ESTADO
        const anteUltEstado = BaseDetalle[1]?.ESTADO
        if (ultEstado == "REFI" || anteUltEstado == "REFI") return "REFI"
    }

    return null
}

const calcularLimite = (limitante, disponible, incremento, MAXIMO_TOMADO) => {
    if (limitante) return LIMITANTES[limitante] * 10000
    return round(Math.min(Math.max(disponible + (incremento * 10000), 0), Math.max(MAXIMO_TOMADO * 2, 15000)), 2)

}



const calcularDisponibleFinalEasy = (limite, { tomadoPrestamosEasy, tomadoFichasEasy }) => {
    return Math.round(Math.max(limite - tomadoPrestamosEasy - tomadoFichasEasy, 0))
}


const calcularMasterEasy = ({ cteData, fichasVigentes, BaseDetalleResumen, BaseDetalleEasy, promedioDiasDeAtraso, fichasVigentesEasy, tomadoPrestamosEasy, tomadoFichasEasy, ZFinal }) => {


    /*Criterio de clientes nuevos */ /*INICIALES - tomado (con evaluacion de limitantes) */
    if (!BaseDetalleEasy.length) {    
        const disponible = INICIALES.EASY - tomadoFichasEasy - tomadoPrestamosEasy;
        const incremento = 0;
        const limitante = calcularLimitante(fichasVigentes, cteData,BaseDetalleEasy)

        const limite = calcularLimite(limitante, disponible, incremento,0)

        const calificacion = INICIALES.CALIFICACION
        
        const disponibleFinal = calcularDisponibleFinalEasy(limite,{tomadoFichasEasy,tomadoPrestamosEasy})

        return { disponible, incremento, limitante, limite, disponibleFinal, calificacion }
    }

    // if (!BaseDetalleEasy.length && fichasVigentesEasy) {
    //     const disponible = INICIALES.EASY - tomadoFichasEasy - tomadoPrestamosEasy;
    //     const incremento = 0;
    //     const limitante = calcularLimitante(fichasVigentes, cteData,BaseDetalleEasy)

    //     const limite = calcularLimite(limitante, disponible, incremento)

    //     const calificacion = INICIALES.CALIFICACION
        
    //     const disponibleFinal = calcularDisponibleFinalEasy(limite,{tomadoFichasEasy,tomadoPrestamosEasy})

    //     return { disponible, incremento, limitante, limite, disponibleFinal, calificacion }
    // }



    //Evaluacion
    //Abstraer Zfinal

    const disponible = calcularDisponible(ZFinal, BaseDetalleResumen)

    //Abstraer incremento
    const incremento = calcularIncremento(ZFinal, BaseDetalleEasy, promedioDiasDeAtraso, BaseDetalleResumen)


    //Abstraer limitante
    const limitante = calcularLimitante(fichasVigentes, cteData, BaseDetalleEasy)

    const limite = calcularLimite(limitante, disponible, incremento, BaseDetalleResumen.MAXIMO_TOMADO_CAPITAL)

    const disponibleFinal = calcularDisponibleFinalEasy(limite, { tomadoFichasEasy, tomadoPrestamosEasy })
    return { disponible, incremento, limitante, limite, disponibleFinal }
}









module.exports = { calcularMasterEasy }

