const {MP_OWN_USER,MP_USER} = require("../../constants/permisos");
const {getAside} = require("../lib/aside.js");

const generateAside = async (req,res,next) => {
    const {PERMISOS} = req.user;
    
    if(PERMISOS.includes(MP_OWN_USER) && !PERMISOS.includes(MP_USER)){
        res.locals.aside = await getAside(req.user);
        return next()
    }
    
    res.locals.aside = await getAside();
    next()
    
} 

module.exports = {generateAside}






