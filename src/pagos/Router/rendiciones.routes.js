"use strict";
const Router = require("express").Router();
const { deudaCte,cargarPago,cambiarFecha, codigoDePago, confirmarPago } = require("../controller/pagos.controller.cargar_pago.js");
const { cargarCobranza, redistribuirPago, generarSaldoAnteriorServicio } = require("../controller/pagos.controller.cobranza.js");
const { getRendicionCobranza } = require("../controller/pagos.controller.rendicion.js");
const {hasPermission} = require("../../middlewares/permission.middleware.js");
const {PAGOS_ADMIN,PAGOS_USER} = require("../../constants/permisos.js");





module.exports = {Router}