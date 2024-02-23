
const { FECHA_LIMITE_COMPRA_VIEJA } = require("../../constants/dates.js");


const calcularBienAbonado = (ficha, pagos) => {
    const isFichaVieja = ficha.FECHA < FECHA_LIMITE_COMPRA_VIEJA


    if (ficha.ESTADO != "ACTIVO") return false

    if (ficha.FICHA < 50000 && isFichaVieja) return ficha.TEORICA <= 7

    //REFORMAR, ESTE CALCULO DEBERIA ESTAR ASOCIADO A EL FORMAT DE BASEDETALLE
    const { sumaVariableAtrasos, maxDiaDeAtrasos } = pagos.reduce((acum, pago) =>

    ({
        sumaVariableAtrasos: acum.sumaVariableAtrasos + pago.variableAtraso,
        maxDiaDeAtrasos: Math.max(acum.maxDiaDeAtrasos, pago.diasDeAtraso)
    })

        , { sumaVariableAtrasos: 0, maxDiaDeAtrasos: 0 })
    return sumaVariableAtrasos < 0.5 && maxDiaDeAtrasos < 30
}
module.exports = { calcularBienAbonado }






