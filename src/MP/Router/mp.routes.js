const Router = require("express").Router();
const { MP_USER, MP_OWN_USER } = require("../../constants/permisos.js");
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const mercadoPagoController = require("../controller/api.mp.controller.js");
const { generateAside } = require("../middlewares/aside.middleware.js");
const { checkQuery } = require("../middlewares/checkQuery.js");


Router.get("/pagos_recibidos", hasPermission([MP_USER, MP_OWN_USER]), generateAside, checkQuery, mercadoPagoController.formController);






module.exports = Router;