const destructurarUbicacion = (req,res,next) => {
    req.body.LATITUD = req.body.UBICACION.split(',')[0];
    req.body.LONGITUD = req.body.UBICACION.split(',')[1];
    next();
}




module.exports = {destructurarUbicacion};



