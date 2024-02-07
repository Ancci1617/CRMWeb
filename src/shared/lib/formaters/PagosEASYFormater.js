


const pagosEasyFormater = () => {
    const codigos = filtrarCodigosCte(pagos);
    const pagosFormated = [];

    codigos.forEach(codigo => {
        const pagosFiltrados = pagos.filter(pago => pago.CTE + "-" + pago.FICHA == codigo);
        
        
    });


}


module.exports = {pagosEasyFormater}
