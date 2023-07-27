"use strict";
const Router = require("express").Router();
const {getListadoZonas,getListadoZona,resolucionRevisita} = require("../controller/listado.controller.js");
const {hasPermission} = require("../../middlewares/permission.middleware.js");
const {USER_LISTADO} = require("../../constants/permisos.js");



Router.get("/", hasPermission(USER_LISTADO),getListadoZonas);
Router.get("/:ZONA", hasPermission(USER_LISTADO),getListadoZona);
Router.post("/finalizar_revisita",hasPermission(USER_LISTADO),resolucionRevisita);


// Router.get("/deuda_cte_test",deudaCteTest);





module.exports = Router;




