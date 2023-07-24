"use strict";
const Router = require("express").Router();
const {getListadoZonas,getListadoZona,resolucionRevisita} = require("../controller/listado.controller.js");
const {hasPermission} = require("../../middlewares/permission.middleware.js");
const {LISTADO} = require("../../constants/permisos.js");
// const {isAdmin} = require("../../lib/auth.js");


Router.get("/", hasPermission(LISTADO),getListadoZonas);
Router.get("/:ZONA", hasPermission(LISTADO),getListadoZona);
Router.post("/finalizar_revisita",hasPermission(LISTADO),resolucionRevisita);

// Router.get("/deuda_cte_test",deudaCteTest);





module.exports = Router;




