const Router = require("express").Router();
const mercadoPagoController = require("../controller/api.mp.controller.js");



Router.get("/pagos_recibidos", mercadoPagoController.formController);






module.exports = Router;