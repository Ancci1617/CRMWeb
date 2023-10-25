const Router = require("express").Router();
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const prestamosController = require("../controller/prestamos.controller.js");



Router.get("/cargar_prestamo/:cte",prestamosController.formCargarPrestamo);

Router.post("/cargar_prestamo",prestamosController.postCargarPrestamo);



// Router.get("/pasar_prestamos",)




module.exports = Router;