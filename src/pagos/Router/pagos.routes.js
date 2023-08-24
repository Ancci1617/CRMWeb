"use strict";
const Router = require("express").Router();
const { deudaCredito,deudaCte, cargarPago, cambiarFecha, codigoDePago, confirmarPago, invalidarPago } = require("../controller/pagos.controller.cargar_pago.js");
const { cargarCobranza, redistribuirPago, generarSaldoAnteriorServicio } = require("../controller/pagos.controller.cobranza.js");
const { hasPermission } = require("../../middlewares/permission.middleware.js");
const { PAGOS_ADMIN, PAGOS_USER } = require("../../constants/permisos.js");
// const {isAdmin} = require("../../lib/auth.js");


Router.get("/deuda_cte", deudaCte);
Router.get("/deuda_credito",deudaCredito);
Router.get("/saldo_servicio_anterior", hasPermission(PAGOS_USER), generarSaldoAnteriorServicio);
Router.get("/codigo_pago", hasPermission(PAGOS_USER), codigoDePago);

Router.get("/pasar_cobranza", hasPermission(PAGOS_USER), cargarCobranza);
Router.post("/cargar_pago", hasPermission(PAGOS_USER), cargarPago);
Router.post("/cambio_de_fecha", hasPermission(PAGOS_USER), cambiarFecha);
Router.post("/redistribuir_pago", hasPermission(PAGOS_ADMIN), redistribuirPago);
Router.get("/confirmar_pago", hasPermission(PAGOS_ADMIN), confirmarPago);
Router.get("/invalidar_pago", hasPermission(PAGOS_USER), invalidarPago);





module.exports = Router;




