
const { round } = require("../../lib/numbers");
const { FichasViejas } = require("../constants/dates.js");



const generateSummaryBaseDetalle = (BaseDetalle) => {
    if (!BaseDetalle.length) return { FICHAS: 0, RETIRADAS: 0, DEVOLUCIONES: 0 }

    const summary = BaseDetalle.reduce((acum, ficha) => {


        const { TEORICA, bienAbonado, FECHA, ESTADO, CAPITAL, VALOR_UNITARIO, FICHA } = ficha;

        const esDev = ESTADO == "DEVOLUCION"
        const esRet = ESTADO == "RETIRADO" || ESTADO == "REFI"
        // const esRefi = ESTADO == "REFI"
        /*POR SACAR LAS REFIS DE LA DIVISON PARA CALCULAR EL ZFINAL EASYCASH */
        const esValida = ESTADO == "ACTIVO"
        const { MAXIMO, MINIMO, SUMA_TEORICA,
            MAXIMO_TOMADO, MINIMO_TOMADO, ACUM_VU,
            VIEJAS, NUEVAS, DEVOLUCIONES, RETIRADAS,
            VALIDAS, MAXIMO_TOMADO_CAPITAL, MINIMO_TOMADO_CAPITAL, ACUM_CAPITAL, CREDITOS_BGM, CREDITOS_EASY } = acum;
            
        const isVieja = FECHA < FichasViejas
        const esPrestamo = FICHA >= 50000

        return {
            ...acum,
            ...{
                MAXIMO_TOMADO: bienAbonado ? Math.max(VALOR_UNITARIO, MAXIMO_TOMADO) : MAXIMO_TOMADO,
                MAXIMO_TOMADO_CAPITAL: bienAbonado ? Math.max(CAPITAL, MAXIMO_TOMADO_CAPITAL) : MAXIMO_TOMADO_CAPITAL,
                VIEJAS: VIEJAS + Number(isVieja),
                NUEVAS: NUEVAS + Number(!isVieja),
                DEVOLUCIONES: DEVOLUCIONES + Number(esDev),
                RETIRADAS: RETIRADAS + Number(esRet),
            },
            ...esValida && {
                SUMA_TEORICA: SUMA_TEORICA + TEORICA,
                ACUM_VU: ACUM_VU + VALOR_UNITARIO,
                ACUM_CAPITAL: ACUM_CAPITAL + CAPITAL,
                MINIMO: Math.min(MINIMO, TEORICA),
                MAXIMO: Math.max(MAXIMO, TEORICA),
                MINIMO_TOMADO: Math.min(VALOR_UNITARIO, MINIMO_TOMADO),
                MINIMO_TOMADO_CAPITAL: esPrestamo ? Math.min(CAPITAL, MINIMO_TOMADO_CAPITAL) : MINIMO_TOMADO_CAPITAL,
                VALIDAS: VALIDAS + 1,
                CREDITOS_BGM: CREDITOS_BGM + Number(!esPrestamo),
                CREDITOS_EASY: CREDITOS_EASY + Number(esPrestamo)
            },

        }
    }, {
        SUMA_TEORICA: 0, MINIMO: Infinity, MAXIMO: -Infinity,
        MAXIMO_TOMADO: 0, MINIMO_TOMADO: Infinity,
        ACUM_VU: 0,
        ACUM_CAPITAL: 0,
        VIEJAS: 0,
        NUEVAS: 0,
        DEVOLUCIONES: 0,
        RETIRADAS: 0, VALIDAS: 0,
        MAXIMO_TOMADO_CAPITAL: -Infinity,
        MINIMO_TOMADO_CAPITAL: Infinity,
        CREDITOS_EASY: 0,
        CREDITOS_BGM: 0,
    })

    const creditosValidos = BaseDetalle.length - summary.DEVOLUCIONES - summary.RETIRADAS

    return {
        ...summary,
        PROMEDIO: summary.SUMA_TEORICA / creditosValidos,
        FICHAS: BaseDetalle.length,
        PROMEDIO_TOMADO: round(summary.ACUM_VU / creditosValidos, 2),
        PROMEDIO_TOMADO_CAPITAL: round(summary.ACUM_CAPITAL / creditosValidos, 2)
    }


}

module.exports = { generateSummaryBaseDetalle }

