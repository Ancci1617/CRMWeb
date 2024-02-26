
const { round } = require("../../../lib/numbers");
const { FECHA_LIMITE_COMPRA_VIEJA } = require("../../constants/dates.js");
const { INICIALES } = require("../constants/nuevos.js");

const sustituirInfinite = (evaluar,sustitucion) =>{
    if(Math.abs(evaluar) == Infinity) return sustitucion
    return evaluar
} 

/*Resumen de todas las compras, incluyendo prestamos */
const generateSummaryBaseDetalle = (BaseDetalle) => {
    if (!BaseDetalle.length) return { FICHAS: 0, RETIRADAS: 0, DEVOLUCIONES: 0 }

    const summary = BaseDetalle.reduce((acum, ficha) => {


        const { TEORICA, bienAbonado, FECHA, ESTADO, CAPITAL, VALOR_UNITARIO, FICHA } = ficha;

        
        if(ESTADO == "NO VALIDA") return acum

        const esDev = ESTADO == "DEVOLUCION"
        const esRet = ESTADO == "RETIRADO" || ESTADO == "REFI"
        // const esRefi = ESTADO == "REFI"
        /*POR SACAR LAS REFIS DE LA DIVISON PARA CALCULAR EL ZFINAL EASYCASH */
        const esValida = ESTADO == "ACTIVO"
        

        const { MAXIMO, MINIMO, SUMA_TEORICA,
            MAXIMO_TOMADO, MINIMO_TOMADO, ACUM_VU,
            VIEJAS, NUEVAS, DEVOLUCIONES, RETIRADAS,
            VALIDAS, MAXIMO_TOMADO_CAPITAL, MINIMO_TOMADO_CAPITAL, ACUM_CAPITAL, CREDITOS_BGM, CREDITOS_EASY } = acum;

        const esVieja = FECHA < FECHA_LIMITE_COMPRA_VIEJA
        const esPrestamo = FICHA >= 50000

        return {
            ...acum,


            ...esPrestamo && esValida && {
                MAXIMO_TOMADO_CAPITAL: bienAbonado ? Math.max(CAPITAL, MAXIMO_TOMADO_CAPITAL) : MAXIMO_TOMADO_CAPITAL,
                MINIMO_TOMADO_CAPITAL: esPrestamo ? Math.min(CAPITAL, MINIMO_TOMADO_CAPITAL) : MINIMO_TOMADO_CAPITAL
            },
            ...!esPrestamo && {
                MAXIMO_TOMADO: bienAbonado ? Math.max(VALOR_UNITARIO, MAXIMO_TOMADO) : MAXIMO_TOMADO,
                DEVOLUCIONES: DEVOLUCIONES + Number(esDev),
                RETIRADAS: RETIRADAS + Number(esRet),
            },
            ...esValida && {
                VIEJAS: VIEJAS + Number(esVieja),
                NUEVAS: NUEVAS + Number(!esVieja),
                ACUM_VU: ACUM_VU + VALOR_UNITARIO,
                ACUM_CAPITAL: ACUM_CAPITAL + CAPITAL,
                MINIMO_TOMADO: Math.min(VALOR_UNITARIO, MINIMO_TOMADO),
                VALIDAS: VALIDAS + 1,
                CREDITOS_BGM: CREDITOS_BGM + Number(!esPrestamo),
                CREDITOS_EASY: CREDITOS_EASY + Number(esPrestamo)
            },
            ...esValida && esVieja && !esPrestamo && {
                MINIMO: Math.min(MINIMO, TEORICA),
                MAXIMO: Math.max(MAXIMO, TEORICA),
                SUMA_TEORICA: SUMA_TEORICA + TEORICA
            }

        }
    }, {
        SUMA_TEORICA: 0, MINIMO: Infinity, MAXIMO: -Infinity,
        MAXIMO_TOMADO: 0, MINIMO_TOMADO: Infinity,
        ACUM_VU: 0,
        ACUM_CAPITAL: 0,
        VIEJAS: 0,
        NUEVAS: 0,
        DEVOLUCIONES: 0,
        RETIRADAS: 0,
        VALIDAS: 0,
        MAXIMO_TOMADO_CAPITAL: -Infinity,
        MINIMO_TOMADO_CAPITAL: Infinity,
        CREDITOS_EASY: 0,
        CREDITOS_BGM: 0,
    })

    //SUSTITUYA si no encontro ningun valor que sirva por los valores iniciales
    summary.MINIMO_TOMADO_CAPITAL = sustituirInfinite(summary.MINIMO_TOMADO_CAPITAL,INICIALES.EASY)
    summary.MAXIMO_TOMADO_CAPITAL = sustituirInfinite(summary.MAXIMO_TOMADO_CAPITAL,INICIALES.EASY)

    const creditosValidos = BaseDetalle.length - summary.DEVOLUCIONES - summary.RETIRADAS

    return {
        ...summary,
        PROMEDIO: summary.SUMA_TEORICA / summary.VIEJAS,
        FICHAS: BaseDetalle.length,
        PROMEDIO_TOMADO: round(summary.ACUM_VU / creditosValidos, 2),
        PROMEDIO_TOMADO_CAPITAL: round(summary.ACUM_CAPITAL / creditosValidos || 0, 2)
    }


}

module.exports = { generateSummaryBaseDetalle }

