"use strict";
const Router = require("express").Router();
const pagosController = require("../controller/pagos.controller.cargar_pago.js");
const cobranzasController = require("../controller/pagos.controller.cobranza.js");
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const { PAGOS_ADMIN, PAGOS_USER } = require("../../constants/permisos.js");
const { checkMpAdmin } = require("../middlewares/checkMpAdmin.js");

// const {isAdmin} = require("../../lib/auth.js");


Router.get("/deuda_cte", pagosController.deudaCte);
Router.get("/saldo_servicio_anterior", hasPermission(PAGOS_USER), cobranzasController.generarSaldoAnteriorServicio);
Router.get("/codigo_pago", hasPermission(PAGOS_USER), pagosController.codigoDePago);

Router.get("/pasar_cobranza", hasPermission(PAGOS_USER), cobranzasController.cargarCobranza);

Router.post("/cargar_pago", hasPermission(PAGOS_USER) , checkMpAdmin,pagosController.cargarPago);

Router.post("/redistribuir_pago", hasPermission(PAGOS_ADMIN), cobranzasController.redistribuirPago);
Router.get("/confirmar_pago", hasPermission(PAGOS_ADMIN),pagosController.confirmarPago);
Router.get("/invalidar_pago", hasPermission(PAGOS_USER), pagosController.invalidarPago);






module.exports = Router;




