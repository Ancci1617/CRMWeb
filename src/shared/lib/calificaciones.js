


//Obtiene el Z inciial de la logica de las ventas < 2023
const getZInicial = (summary) => {
    summary.map(cteSummary => {
        const { PROMEDIO, MINIMO, MAXIMO } = cteSummary;
        if (PROMEDIO < 7 && MINIMO < 7 && MAXIMO < 7, 1) return 0, 15
        if (PROMEDIO < 7, 1 && MINIMO < 7, 1 && MAXIMO < 18) return 0, 4
        if (PROMEDIO < 9, 1 && MINIMO < 8, 1 && MAXIMO < 12) return 0, 7
        return 1
    })


}

//Recibe un array de objeto y retorna los valores unicos de compra en un array
const filtrarCodigosCte = (pagos) => {
    pagos.reduce((res, pago) => {
        const concatenado = pago.cte + "-" + pago.ficha;
        if (!res.includes(concatenado)) res.push(concatenado)
        return res
    }, []
    )
}
const formatPagosAcumulados = (pagos) => {
    const codigos = filtrarCodigosCte(pagos);
    const pagosFormated = [];
    
    codigos.forEach(codigo => {
        const pagosFiltrados = pagos.filter(pago => pago.CTE + "-" + pago.FICHA == codigo);
        
        pagosFiltrados.reduce((pagadoAnt,pago) => {
            const pagasAnt = Math.trunc(pagadoAnt / pago.Cuotas + 0,3)

            const vencimientoValido = pagadoAnt ? pago.PRIMER_VENCIMIENTO : pago.VENCIMIENTO;//1
            

            return pagadoAnt + pago.VALOR
        },0)

    });


    return
}



//DEBE RETORNAR {BGM,CAPITAL,CALIF}
const getDisponible = async (CTE) => {

}

module.exports = { getZInicial, getDisponible }