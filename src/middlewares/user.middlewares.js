
/**
 * @param {Response} res 
 * 
 */

const { getToday } = require("../lib/dates");
const permisos = require("../constants/permisos.js");
const meses = require("../constants/dates.js")

const userView = (req, res, next) => {
    res.locals.user = req.user;
    res.locals.getToday = getToday;
    res.locals.permisos = permisos;
    res.locals.meses = meses;

    res.locals.hasPermission = (permiso) => {
        const {PERMISOS} = req.user;
        if (PERMISOS.includes("*")) return true;

        if (Array.isArray(permiso)) {
            return !!PERMISOS.find(permisoIterado => permiso.includes(permisoIterado));
        }

        return PERMISOS.includes(permiso);


    }

    next();
}



module.exports = { userView };
