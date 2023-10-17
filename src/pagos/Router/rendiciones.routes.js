"use strict";

const Router = require("express").Router();
const { rendicionReceptor, generarRendicion, cargarEfectivo, updateEditable, cargarGasto, borrarGasto } = require("../controller/rendicion.controller.js")
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const permisos = require("../../constants/permisos.js");


Router.get("/rendicion_receptor", hasPermission(permisos.PAGOS_USER), rendicionReceptor);

Router.get("/borrar_gasto", hasPermission(permisos.PAGOS_USER), borrarGasto)
Router.post("/cargar_efectivo", hasPermission(permisos.PAGOS_ADMIN), cargarEfectivo);
Router.post("/cambiar_editable", hasPermission(permisos.PAGOS_ADMIN), updateEditable);
Router.post("/cargar_gasto", hasPermission(permisos.PAGOS_USER), cargarGasto);




module.exports = Router;