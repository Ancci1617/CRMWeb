

const validateParamsNCTE = (req,res,next) => {

    if (req.params.cte == "0") return res.status(400).send("Se debe evaluar un cliente antes de pedir edicion a los datos..");
    next();
}

module.exports = {validateParamsNCTE}


