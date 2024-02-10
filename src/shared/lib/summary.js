const { sumarMeses } = require("../../lib/dates.js");
const { round } = require("../../lib/numbers");
const { FichasViejas } = require("../constants/dates.js");



const generateSummaryBaseDetalle = (BaseDetalle, Easy = false) => {
    const VALOR_A_EVALUAR = Easy ? "CAPITAL" : "VALOR_UNITARIO";

    if (!BaseDetalle.length) return { FICHAS: 0, RETIRADAS: 0, DEVOLUCIONES: 0 }

    const summary = BaseDetalle.reduce((acum, ficha) => {


        const { TEORICA, bienAbonado, FECHA, ESTADO } = ficha;
        const esDev = ESTADO == "DEVOLUCION"
        const esRet = ESTADO == "RETIRADO" || ESTADO == "REFI"
        // const esRefi = ESTADO == "REFI"
        /*POR SACAR LAS REFIS DE LA DIVISON PARA CALCULAR EL ZFINAL EASYCASH */
        const esValida = ESTADO == "ACTIVO"
        const VALOR_EVALUADO = ficha[VALOR_A_EVALUAR]
        const { MAXIMO, MINIMO, SUMA_TEORICA, MAXIMO_TOMADO, MINIMO_TOMADO, ACUM_VU, VIEJAS, NUEVAS, DEVOLUCIONES, RETIRADAS } = acum;
        const isVieja = FECHA < FichasViejas

        return {
            SUMA_TEORICA: SUMA_TEORICA + (esValida ? TEORICA : 0),
            MINIMO: esValida ? Math.min(MINIMO, TEORICA) : MINIMO,
            MAXIMO: esValida ? Math.max(MAXIMO, TEORICA) : MAXIMO,
            MAXIMO_TOMADO: bienAbonado ? Math.max(VALOR_EVALUADO, MAXIMO_TOMADO) : MAXIMO_TOMADO,
            MINIMO_TOMADO: esValida ? Math.min(VALOR_EVALUADO,MINIMO_TOMADO) : MINIMO_TOMADO,
            ACUM_VU: ACUM_VU + (esValida ? VALOR_EVALUADO : 0),
            // REFI : ,
            VIEJAS: VIEJAS + Number(isVieja),
            NUEVAS: NUEVAS + Number(!isVieja),
            DEVOLUCIONES: DEVOLUCIONES + Number(esDev),
            RETIRADAS: RETIRADAS + Number(esRet)

        }
    }, {
        SUMA_TEORICA: 0, MINIMO: Infinity, MAXIMO: -Infinity,
        MAXIMO_TOMADO: 0, MINIMO_TOMADO: Infinity, ACUM_VU: 0, VIEJAS: 0, NUEVAS: 0, DEVOLUCIONES: 0, RETIRADAS: 0
    })

    const creditosValidos = BaseDetalle.length - summary.DEVOLUCIONES - summary.RETIRADAS
    // console.log(summary.ACUM_VU / creditosValidos);

    // console.log(Math.round(parseFloat(2.425 * 10 ** 2).toFixed(1)));
    // console.log(parseFloat(parseFloat(2.425 * 10 ** 2).toFixed(1)));

    // console.log(round(2.42 ));

    return {
        ...summary,
        PROMEDIO: summary.SUMA_TEORICA / creditosValidos,
        FICHAS: BaseDetalle.length,
        PROMEDIO_TOMADO: round(summary.ACUM_VU / creditosValidos, 2),
        Easy,
        COMPRAS_TERMINADAS: BaseDetalle.length - BaseDetalle.DEVOLUCIONES - BaseDetalle.RETIRADAS
    }


}

module.exports = { generateSummaryBaseDetalle }

