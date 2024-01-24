const Router = require("express").Router();
const permisos = require("../../constants/permisos.js");
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const mercadoPagoController = require("../controller/api.mp.controller.js");



Router.post("/check_mp", hasPermission(permisos.PAGOS_USER),mercadoPagoController.postCheckMP);
Router.get("/getSaldosMp",mercadoPagoController.getSaldoEnCuentasPorReporte);






module.exports = Router;