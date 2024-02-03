const { getFichas } = require("../../model/CRM/get_tablas/get_fichas.js");

const validateParamsNCTE = (req, res, next) => {

    if (req.params.cte == "0") return res.status(400).send("Se debe evaluar un cliente antes de pedir edicion a los datos..");
    next();
}


const validateFicha = async (req, res, next) => {
    const { FICHA } = req.params;
    const { TOTAL, CUOTA, CUOTA_ANT } = req.body;
    // if (parseInt(TOTAL) % parseInt(CUOTA) != 0)
    //     return res.status(400).send("El total no es divisible por el valor de la cuota")

    const [ficha_data] = await getFichas("FICHA", FICHA);
    const { ANT, MES0, MES1, MES2, MES3, MES4, MES5 } = ficha_data;
    const CUOTA_ANT_CALCULADA = parseInt(TOTAL) - (ANT || 0) - (MES0 || 0) - (MES1 || 0) - (MES2 || 0) - (MES3 || 0) - (MES4 || 0) - (MES5 || 0);

    if (CUOTA_ANT != CUOTA_ANT_CALCULADA)
        return res.status(400).send("El saldo anterior declarado no coincide con los pagos, el total del cliente");




    next()
}




module.exports = { validateParamsNCTE, validateFicha }


