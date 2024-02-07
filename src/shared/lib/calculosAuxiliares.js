const calcularPagas = (pagado, valorCuota, redondeo) => {
    return Math.trunc(pagado / valorCuota + redondeo);
}

//El summary debe ser el summary de la BaseDetalle recibida
const calcularIncremento = (Z, BaseDetalle, promedioDiasDeAtraso, summary,diasDeAtrasoPorGrupo = [7,14]) => {
    const { FICHAS: cantidadDeCreditos, NUEVAS ,Easy} = summary
    const ultBienAbonado = BaseDetalle[0].bienAbonado
    const anteUltBienAbonado = BaseDetalle[1]?.bienAbonado || false
    const ultimosBienAbonados = cantidadDeCreditos == 1 ? ultBienAbonado : ultBienAbonado && anteUltBienAbonado
    if (Z >= 0.5 || !ultimosBienAbonados) {
        if (promedioDiasDeAtraso < diasDeAtrasoPorGrupo[0]) return 0
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[1]) return -1
        return -2
    }

    //0 y 0,5
    if (Z >= 0.25 || cantidadDeCreditos == 1 || (Easy ? false : NUEVAS == 0)) {
        if (promedioDiasDeAtraso < diasDeAtrasoPorGrupo[0]) return 1
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[1]) return 0
        return -1
    }
    if (Z >= 0) {
        if (promedioDiasDeAtraso < diasDeAtrasoPorGrupo[0]) return 2
        if (promedioDiasDeAtraso <= diasDeAtrasoPorGrupo[1]) return 1
    }
    return 0
}


module.exports = {calcularPagas,calcularIncremento}