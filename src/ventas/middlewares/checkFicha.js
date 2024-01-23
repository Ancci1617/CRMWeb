
const checkFicha = (req,res,next) => {
    const {TOTAL,CUOTA,ANTICIPO_PREPAGO,CUOTAS} = req.body;


    if(parseInt(TOTAL) != CUOTA * CUOTAS + (parseInt(ANTICIPO_PREPAGO)|| 0)){
        return res.send("El total debe ser igual a las cuotas + el anticipo en caso de ser prepago");
    }

    next()
}


module.exports = {checkFicha}
