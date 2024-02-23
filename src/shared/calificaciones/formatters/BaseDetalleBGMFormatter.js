const { createIndexedOfArr } = require("../../lib/indexedArrays.js");
const { calcularBienAbonado } = require("../lib/calcularBienAbonado.js");





const formatBaseDetalle = (BaseDetalle, pagos) => {

    const pagosIndexados = createIndexedOfArr(pagos, "CODIGO")

    return BaseDetalle.map(ficha => {
        const pagosFicha = pagosIndexados[ficha.CODIGO] || []
        const bienAbonado = calcularBienAbonado({ ESTADO: ficha.ESTADO, FICHA: ficha.FICHA, TEORICA: ficha.TEORICA,FECHA : ficha.FECHA }, pagosFicha)
        return { ...ficha, bienAbonado }
    });

}
module.exports = { formatBaseDetalle }



