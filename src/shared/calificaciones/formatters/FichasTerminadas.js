const { dateDiff, getToday } = require("../../../lib/dates.js")
const { round } = require("../../../lib/numbers.js")
const { calcularBienAbonado } = require("../lib/calcularBienAbonado.js")


const calcularTeorica = ({FECHA}) => {
    const termino = getToday().slice(0, 8) + "01"
    const pagoEn = round(dateDiff(termino,FECHA) / 30,0)
    const originales = 12
    return pagoEn - originales + 6  
}

const fichasAsBaseDetalle = (fichas, pagos) => {

    const terminadas = fichas.filter(fichas => fichas.SALDO <= 0)

    return terminadas.map(ficha => {
        // const TEORICA =  ;

        const pagosFicha = pagos.filter(pago => pago.CODIGO == ficha.CODIGO)
        const TEORICA = calcularTeorica({FECHA : ficha.FECHA})
        const bienAbonado = calcularBienAbonado({ ESTADO: ficha.ESTADO, FICHA: ficha.FICHA, TEORICA }, pagosFicha)
        
        return { ...ficha,TEORICA, bienAbonado }
    });
}


module.exports = {fichasAsBaseDetalle}
// const bienAbonado = calcularBienAbonado({ESTADO : ficha.ESTADO,FICHA : ficha.FICHA,TEORIA : ficha.TEORIA}, pagosFicha,Easy)





