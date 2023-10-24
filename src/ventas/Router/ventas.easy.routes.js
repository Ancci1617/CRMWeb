const Router = require("express").Router();
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const ventasController = require("../controller/ventas.controller.js");




Router.get("/cargar_prestamo/:cte",ventasController.formCargarPrestamo);

// Router.post("/cargar_prestamo",ventasController.postCargarPrestamo);






module.exports = Router;