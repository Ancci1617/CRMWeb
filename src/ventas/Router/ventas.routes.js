"use strict";
const Router = require("express").Router();
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const { VENTAS_USER, VENTAS_GERENCIA, VENTAS_ADMIN } = require("../../constants/permisos.js");
const { validateSchema } = require("../../shared/middlewares/validateSchema.js");
// const {isAdmin} = require("../../lib/auth.js");
const ventasController = require("../controller/ventas.controller.js");
const { isOwnSell, isOwnSellPost } = require("../middlewares/custom.permissions.js");
const { ventaSchema } = require("../schema/venta.schema.js");
const {checkFicha} = require("../middlewares/checkFicha.js");

    


// Router.get("/ventas_cargadas_general",hasPermission(VENTAS_USER),ventasController.ventasCargadasGeneral);

//Admin
Router.get("/pasar_ventas", hasPermission(VENTAS_USER), ventasController.verVentas);
Router.get("/aprobar/:ID",hasPermission(VENTAS_ADMIN),ventasController.cambiarAprobacion("APROBADO"))
Router.get("/desaprobar/:ID",hasPermission(VENTAS_ADMIN),ventasController.cambiarAprobacion("DESAPROBADO"))


//Cargar
Router.get("/cargar_venta/:cte", hasPermission(VENTAS_USER), ventasController.formCargarVenta);


Router.post("/cargar_venta",
    hasPermission(VENTAS_USER),
    validateSchema(ventaSchema),
    checkFicha,
    ventasController.postCargarVenta);




Router.post("/precios",hasPermission(VENTAS_USER),ventasController.consultarPrecios); 


//Editar
Router.get("/editar/:INDICE", hasPermission(VENTAS_USER), isOwnSell, ventasController.formEditarVenta);
Router.post("/editar", hasPermission(VENTAS_USER), isOwnSellPost, ventasController.postEditarVenta);

//Borrar
Router.get("/borrar/:INDICE", hasPermission(VENTAS_GERENCIA), ventasController.borrarVenta);

//Confirmar
Router.get("/confirmar/:INDICE", hasPermission(VENTAS_ADMIN), ventasController.confirmarVenta);


module.exports = Router;




