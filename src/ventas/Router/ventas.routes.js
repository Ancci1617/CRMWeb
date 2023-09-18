"use strict";
const Router = require("express").Router();
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const { VENTAS_USER, VENTAS_GERENCIA, VENTAS_ADMIN } = require("../../constants/permisos.js");
// const {isAdmin} = require("../../lib/auth.js");
const ventasController = require("../controller/ventas.controller.js");
const {isOwnSell,isOwnSellPost} = require("../middlewares/custom.permissions.js");



//Admin
Router.get("/pasar_ventas", hasPermission(VENTAS_USER), ventasController.cargarVentas);

//Cargar
Router.get("/cargar_venta/:cte", hasPermission(VENTAS_USER), ventasController.formCargarVenta);
Router.post("/cargar_venta", hasPermission(VENTAS_USER), ventasController.postCargarVenta);

//Editar
Router.get("/editar/:INDICE", hasPermission(VENTAS_USER),isOwnSell, ventasController.formEditarVenta);
Router.post("/editar", hasPermission(VENTAS_USER) ,isOwnSellPost, ventasController.postEditarVenta);

//Borrar
Router.get("/borrar/:INDICE", hasPermission(VENTAS_GERENCIA), ventasController.borrarVenta);

//Confirmar
Router.get("/confirmar/:INDICE",hasPermission(VENTAS_ADMIN), ventasController.confirmarVenta);


module.exports = Router;




