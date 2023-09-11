"use strict";
const Router = require("express").Router();
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const { VENTAS_USER } = require("../../constants/permisos.js");
// const {isAdmin} = require("../../lib/auth.js");
const ventasController = require("../controller/ventas.controller.js");


Router.get("/pasar_ventas",hasPermission(VENTAS_USER),ventasController.cargarVentas);






module.exports = Router;




