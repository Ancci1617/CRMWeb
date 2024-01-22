const { MP_ADMIN } = require("../../constants/permisos");
const { hasPermission } = require("../../middlewares/permission.middleware.js");

const checkMpAdmin = (req, res, next) => {
    const { N_OPERACION } = req.body;
    if (N_OPERACION)
        return hasPermission(MP_ADMIN,"No tenes permisos para asignar pagos de transferencias")(req, res, next);
    next();

}


module.exports = { checkMpAdmin }