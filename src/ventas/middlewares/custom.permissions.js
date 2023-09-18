const ventasModel = require("../model/ventas.model.js");

const isOwnSell = async (req, res, next) => {
    const { Usuario } = req.user;

    const [venta] = await ventasModel.getVentas({ filter: { INDICE: req.params.INDICE } });
    res.locals.venta = venta;


    if (res.locals.hasPermission(res.locals.permisos.VENTAS_ADMIN) || venta.USUARIO == Usuario) return next()

    return res.status(403).send('No se pueden editar ventas de otro vendedor.');


}

const isOwnSellPost = async (req, res, next) => {
    const { Usuario } = req.user;
    const [venta] = await ventasModel.getVentas({ filter: { "VentasCargadas.INDICE": req.body.ID } })
    res.locals.venta = venta;

    if (res.locals.hasPermission(res.locals.permisos.VENTAS_ADMIN) || venta.USUARIO == Usuario) return next()

    return res.status(403).send('No se pueden editar ventas de otro vendedor.');
}


module.exports = { isOwnSell, isOwnSellPost }