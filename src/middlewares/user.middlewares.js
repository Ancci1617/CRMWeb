
/**
 * @param {Response} res 
 * 
 */

const {getToday} = require("../lib/dates");
const permisos = require("../constants/permisos.js");

const userView = (req,res,next) => {
    res.locals.user = req.user;
    res.locals.getToday = getToday;
    res.locals.permisos = permisos;

    res.locals.hasPermission = (permiso) => {
        return req.user.PERMISOS.includes("*") ? true : req.user.PERMISOS.includes(permiso);
    }

    next();
}



module.exports = {userView};
