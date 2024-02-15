const { splitPrestamosFichas } = require("./fichas");

const calcularPagas = (pagado, valorCuota, redondeo) => {
    return Math.trunc(pagado / valorCuota + redondeo);
}

//El summary debe ser el summary de la BaseDetalle recibida
const calcularIncremento = (Z, BaseDetalle, promedioDiasDeAtraso, summary, diasDeAtrasoPorGrupo = [7, 14], Easy) => {

    const { FICHAS: cantidadDeCreditos, NUEVAS } = summary
    const ultBienAbonado = BaseDetalle[0].bienAbonado
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

const calcularTomado = (fichasVigentes) => {
    const { prestamos, fichas } = splitPrestamosFichas(fichasVigentes)
    const { tomadoPrestamosEasy, tomadoPrestamosBGM } = prestamos.reduce((acum, prestamo) => ({

        tomadoPrestamosEasy: Math.max(acum.tomadoPrestamosEasy + prestamo.capitalTomado,0),
        tomadoPrestamosBGM: acum.tomadoPrestamosBGM + prestamo.VALOR_UNITARIO

    }), { tomadoPrestamosEasy: 0, tomadoPrestamosBGM: 0 })

    const tomadoFichasBGM = fichas.reduce((acum, ficha) => acum + ficha.VU, 0)
    const tomadoFichasEasy = tomadoFichasBGM * 12000
    return { tomadoFichasBGM, tomadoFichasEasy, tomadoPrestamosEasy, tomadoPrestamosBGM }

}

const calcularZFinal = (ZInicial, cantidadDeCreditosViejos, cantidadDeCreditosTotales, pagos, ratioCreditosActivos) => {

    const variableAtrasoAnt = parseFloat((ZInicial * cantidadDeCreditosViejos).toFixed(2))
    const sumVariableDeAtraso = variableAtrasoAnt + pagos.reduce((acum, pago) => acum + pago.variableAtraso, 0)

    return sumVariableDeAtraso / (cantidadDeCreditosTotales + ratioCreditosActivos) || 0

}





module.exports = { calcularPagas, calcularIncremento, calcularTomado, calcularZFinal }