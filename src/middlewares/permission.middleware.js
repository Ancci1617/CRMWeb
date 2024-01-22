
function hasPermission(permiso,msg) {
    return function (req, res, next) {
        
        if (res.locals.hasPermission(permiso)) return next();

        


        return res.status(403).send( msg || 'No tenes permiso para acceder a esta funcionalidad.');
    }
}



module.exports = { hasPermission }
