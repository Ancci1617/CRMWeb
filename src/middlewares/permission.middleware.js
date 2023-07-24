
function hasPermission(permiso) {
    return function (req, res, next) {

        if (!req.user.PERMISOS.includes(permiso)) {
            return res.status(403).send('No tienes permiso para acceder a esta funcionalidad.');
        }
        next();
    };
}



module.exports = {hasPermission}
