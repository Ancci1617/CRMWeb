const { round } = require("../../lib/numbers");
const { FichasViejas } = require("../constants/dates.js");



const generateSummaryBaseDetalle = (BaseDetalle,Easy = false) => {
    const VALOR_A_EVALUAR = Easy ? "CAPITAL": "VALOR_UNITARIO";
    
    const summary = BaseDetalle.reduce((acum, ficha) => {

        const { TEORICA, bienAbonado,  FECHA, ESTADO } = ficha;
        const VALOR_EVALUADO = ficha[VALOR_A_EVALUAR]
        const { MAXIMO, MINIMO, SUMA_TEORICA, MAXIMO_TOMADO, MINIMO_TOMADO, ACUM_VU, VIEJAS, NUEVAS, DEVOLUCIONES, RETIRADAS } = acum;
        const isVieja = FECHA < FichasViejas

        return {
            SUMA_TEORICA: SUMA_TEORICA + TEORICA,
            MINIMO: TEORICA < MINIMO ? TEORICA : MINIMO,
            MAXIMO: TEORICA > MAXIMO ? TEORICA : MAXIMO,
            MAXIMO_TOMADO: bienAbonado ? Math.max(VALOR_EVALUADO, MAXIMO_TOMADO) : MAXIMO_TOMADO,
            MINIMO_TOMADO: Math.min(MINIMO_TOMADO, VALOR_EVALUADO),
            ACUM_VU: VALOR_EVALUADO + ACUM_VU,
            VIEJAS: VIEJAS + Number(isVieja),
            NUEVAS: NUEVAS + Number(!isVieja),
            DEVOLUCIONES: DEVOLUCIONES + Number(ESTADO == "DEVOLUCION"),
            RETIRADAS: RETIRADAS + Number(ESTADO == "RETIRADO")


        }
    }, { SUMA_TEORICA: 0, MINIMO: BaseDetalle[0].TEORICA, MAXIMO: BaseDetalle[0].TEORICA, 
        MAXIMO_TOMADO: 0, MINIMO_TOMADO: BaseDetalle[0][VALOR_A_EVALUAR], ACUM_VU: 0, VIEJAS: 0, NUEVAS: 0, DEVOLUCIONES: 0, RETIRADAS: 0 })


    return {
        ...summary,
        PROMEDIO: summary.SUMA_TEORICA / BaseDetalle.length,
        FICHAS: BaseDetalle.length,
        PROMEDIO_TOMADO: round(summary.ACUM_VU / BaseDetalle.length, 1),Easy
    }


}

module.exports = { generateSummaryBaseDetalle }

