"use strict";

const Router = require("express").Router();
const { rendicionReceptor, generarRendicion, cargarEfectivo, updateEditable, cargarGasto, borrarGasto } = require("../controller/rendicion.controller.js")
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const { PAGOS_ADMIN, PAGOS_USER } = require("../../constants/permisos.js");
const permisos = require("../../constants/permisos.js");

function generarRendicionValidation(req, res, next) {
    if (res.locals.hasPermission(permisos.PAGOS_ADMIN) || req.user.Usuario == req.body.COB)
        next();

    return res.send("No tiene permisos para ejecutar esta funcionalidad");
}

Router.get("/rendicion_receptor", hasPermission(PAGOS_USER), rendicionReceptor);
Router.get("/generar_rendicion", generarRendicionValidation, generarRendicion);

Router.get("/borrar_gasto", hasPermission(PAGOS_USER), borrarGasto)
Router.post("/cargar_efectivo", hasPermission(PAGOS_ADMIN), cargarEfectivo);
Router.post("/cambiar_editable", hasPermission(PAGOS_ADMIN), updateEditable);
Router.post("/cargar_gasto", hasPermission(PAGOS_USER), cargarGasto);




module.exports = Router;