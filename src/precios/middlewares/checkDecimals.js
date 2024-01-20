const {isDecimal} = require("../../lib/numbers.js");

const checkDecimals = (req, res, next) => {
    const { CUOTAS_3, CUOTAS_6, CUOTAS_9 } = req.body;
    const errors = [];

    if (isDecimal(CUOTAS_3 / 3)) errors.push("El valor de la cuota en 3 cuotas, debe ser un numero redondo.")
    if (isDecimal(CUOTAS_6 / 6)) errors.push("El valor de la cuota en 6 cuotas, debe ser un numero redondo.")
    if (isDecimal(CUOTAS_9 / 9)) errors.push("El valor de la cuota en 9 cuotas, debe ser un numero redondo.")

    if (errors.length)
        return res.send(errors)

    next()
}



module.exports = { checkDecimals }