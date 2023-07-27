
function hasPermission(permiso) {
    return function (req, res, next) {
        if (res.locals.hasPermission(permiso)) return next();
        
        return res.status(403).send('No tenes permiso para acceder a esta funcionalidad.');
    }
}


module.exports = { hasPermission }
