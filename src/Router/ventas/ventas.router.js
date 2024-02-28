const Router = require("express").Router();
const { isLoggedIn } = require("../../lib/auth");
const ventasController = require("../../controller/ventas.controller.js");




Router.post("/cargar_venta", isLoggedIn, ventasController.postCargarVenta);

Router.post("/query_prepago_entrega", isLoggedIn, ventasController.getEntregaDePrepago);





Router.post("/ventas_cargadas/editar", isLoggedIn, ventasController.updateVenta);

Router.get("/eliminar_venta/:indice", isLoggedIn, ventasController.eliminarVenta);




module.exports = Router;


