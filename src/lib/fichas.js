const splitPrestamosFichas = (fichasAEvaluar) => {
    const prestamos = fichasAEvaluar.filter(ficha => ficha.FICHA >= 50000)
    const fichas = fichasAEvaluar.filter(ficha => ficha.FICHA < 50000)
    return { prestamos, fichas }
}

module.exports = {splitPrestamosFichas}