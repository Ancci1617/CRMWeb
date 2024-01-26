

const checkCaracters = (...caracters) => (req, res, next) => {
    const { Producto } = req.body;

    const generateErrorMessage = (caracter) => {
        return `La descripcion del producto no debe contener el caracter: ${caracter} \n`
    }

    const error_message = caracters.reduce((acum,caracter) => {
        const caracterEncontrado = Producto.includes(caracter) || false
        return acum + (caracterEncontrado ? generateErrorMessage(caracter) : "");
    },"");
    if(!error_message) return next()
    
    res.send(error_message)
    
}



module.exports = {  checkCaracters }

