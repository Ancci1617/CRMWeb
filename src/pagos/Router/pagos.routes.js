"use strict";
const Router = require("express").Router();
const { deudaCte, cargarPago, cambiarFecha,codigoDePago,deudaCteTest} = require("../controller/pagos.controller.cargar_pago.js");
const {cargarCobranza,redistribuirPago} = require("../controller/pagos.cobranza.js");



Router.get("/deuda_cte",  deudaCte);
Router.get("/codigo_pago", codigoDePago);
Router.post("/cargar_pago", cargarPago);
Router.post("/cambio_de_fecha", cambiarFecha);
Router.get("/deuda_cte_test",deudaCteTest);
Router.get("/pasar_cobranza",cargarCobranza);
Router.post("/redistribuir_pago",redistribuirPago);






module.exports = Router;




