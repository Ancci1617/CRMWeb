const { calcularBienAbonado } = require("./helper/calcularBienAbonado");





const formatBaseDetalle = (BaseDetalle, pagos,Easy) => {
    return BaseDetalle.map(ficha => {
        const pagosFicha = pagos.filter(pago => pago.CODIGO == ficha.CODIGO)
        const bienAbonado = calcularBienAbonado({ESTADO : ficha.ESTADO,FICHA : ficha.FICHA,TEORIA : ficha.TEORIA}, pagosFicha,Easy)
        return { ...ficha, bienAbonado }
    });

}
module.exports = { formatBaseDetalle }



