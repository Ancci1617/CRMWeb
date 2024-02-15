

const filtrarCodigosCte = (pagos) => {
    const codigos = pagos.reduce((acum, pago) => {
        const concatenado = pago.CTE + "-" + pago.FICHA;
        if (!acum.includes(concatenado)) acum.push(concatenado)
        return acum
    }, [])
    return codigos
}


module.exports = {filtrarCodigosCte}