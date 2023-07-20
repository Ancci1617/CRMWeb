"use strict";
const Router = require("express").Router();
const { deudaCte, cargarPago, cambiarFecha, codigoDePago, confirmarPago } = require("../controller/pagos.controller.cargar_pago.js");
const { cargarCobranza, redistribuirPago, generarSaldoAnteriorServicio } = require("../controller/pagos.controller.cobranza.js");
const { getRendicionCobranza } = require("../controller/pagos.controller.rendicion.js");

// const {isAdmin} = require("../../lib/auth.js");


Router.get("/rendicion", getRendicionCobranza);
Router.get("/saldo_servicio_anterior", generarSaldoAnteriorServicio);
Router.get("/deuda_cte", deudaCte);
Router.get("/codigo_pago", codigoDePago);
Router.post("/cargar_pago", cargarPago);
Router.post("/cambio_de_fecha", cambiarFecha);
Router.get("/pasar_cobranza", cargarCobranza);
Router.post("/redistribuir_pago", redistribuirPago);
Router.get("/confirmar_pago", confirmarPago);


// Router.get("/deuda_cte_test",deudaCteTest);





module.exports = Router;




