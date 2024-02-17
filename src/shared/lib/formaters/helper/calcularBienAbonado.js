
const { FichasViejas } = require("../../../constants/dates.js");


const calcularBienAbonado = (ficha, pagos, Easy = false) => {
    
    if (ficha.ESTADO != "ACTIVO") return false
    
    if (!Easy && ficha.FICHA < 50000) {
        const isFichaVieja = ficha.FECHA < FichasViejas
        if (isFichaVieja) return ficha.TEORICA <= 7
    }
    //REFORMAR, ESTE CALCULO DEBERIA ESTAR ASOCIADO A EL FORMAT DE BASEDETALLE
    const { sumaVariableAtrasos, maxDiaDeAtrasos } = pagos.reduce((acum, pago) =>

    ({
        sumaVariableAtrasos: acum.sumaVariableAtrasos + pago.variableAtraso,
        maxDiaDeAtrasos: Math.max(acum.maxDiaDeAtrasos, pago.diasDeAtraso)
    })

        , { sumaVariableAtrasos: 0, maxDiaDeAtrasos: 0 })
    return sumaVariableAtrasos < 0.5 && maxDiaDeAtrasos < 30
}
module.exports = {calcularBienAbonado}






