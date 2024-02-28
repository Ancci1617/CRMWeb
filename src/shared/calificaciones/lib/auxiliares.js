const { round } = require("../../../lib/numbers.js");



const calcularPagas = (pagado, valorCuota, redondeo) => {
    return Math.trunc(pagado / valorCuota + redondeo);
}

//El summary debe ser el summary de la BaseDetalle recibida
const calcularIncremento = (Z, BaseDetalle, promedioDiasDeAtraso, summary, diasDeAtrasoPorGrupo = [7, 14], Easy = false) => {

    const { FICHAS: cantidadDeCreditos, NUEVAS } = summary
    const ultBienAbonado = BaseDetalle[0]?.bienAbonado
    const anteUltBienAbonado = BaseDetalle[1]?.bienAbonado || false
    const ultimosBienAbonados = cantidadDeCreditos == 1 ? ultBienAbonado : ultBienAbonado && anteUltBienAbonado



    if (Z >= 0.5 || !ultimosBienAbonados) {
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[0]) return 0
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[1]) return -1
        return -2
    }

    //0 y 0,5
    if (Z > 0.25 || cantidadDeCreditos == 1 || (Easy ? false : NUEVAS == 0)) {
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[0]) return 1
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[1]) return 0
        return -1
    }
    if (Z >= 0) {
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[0]) return 2
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[1]) return 1
    }
    return 0
}

const calcularTomado = ({ fichasVigentesEasy, fichasVigentesBgm }) => {

    const { tomadoPrestamosEasy, tomadoPrestamosBGM } = fichasVigentesEasy.reduce((acum, prestamo) => {

        //Solo calcula el tomado de los prestamos activos
        const esValido = prestamo.ESTADO == "ACTIVO";
        if(!esValido) return acum;


        return  {
            tomadoPrestamosEasy: Math.max(acum.tomadoPrestamosEasy + prestamo.capitalTomado, 0),
            tomadoPrestamosBGM: acum.tomadoPrestamosBGM + prestamo.VALOR_UNITARIO    
        }
    }, { tomadoPrestamosEasy: 0, tomadoPrestamosBGM: 0 })

    //Solo calcula el tomado de las fichas activas
    const tomadoFichasBGM = fichasVigentesBgm.reduce((acum, ficha) => ficha.ESTADO == "ACTIVO" ? acum + ficha.VALOR_UNITARIO : 0, 0)
    const tomadoFichasEasy = tomadoFichasBGM * 12000
    return { tomadoFichasBGM, tomadoFichasEasy, tomadoPrestamosEasy, tomadoPrestamosBGM }

}

const calcularZFinal = (ZInicial, cantidadDeCreditosViejos, cantidadDeCreditosTotales, pagos, ratioCreditosActivos) => {



    const variableAtrasoAnt = parseFloat((ZInicial * cantidadDeCreditosViejos).toFixed(2))



    const sumVariableDeAtraso = variableAtrasoAnt + pagos.reduce((acum, pago) => acum + pago.variableAtraso, 0)



    const ZFinal = round(sumVariableDeAtraso / (cantidadDeCreditosTotales + ratioCreditosActivos), 2);

    return !ZFinal || ZFinal == Infinity ? 0 : ZFinal

}


const getZInicial = (cteSummary) => {

    if (!cteSummary.VIEJAS) return 0

    const { PROMEDIO, MINIMO, MAXIMO } = cteSummary;
    if (PROMEDIO < 7 && MINIMO < 7 && MAXIMO < 7.1) return 0.15
    if (PROMEDIO < 7.1 && MINIMO < 7.1 && MAXIMO < 8) return 0.4
    if (PROMEDIO < 9.1 && MINIMO < 8.1 && MAXIMO < 12) return 0.55
    return 0.55

}

module.exports = { calcularPagas, calcularIncremento, calcularTomado, calcularZFinal, getZInicial }