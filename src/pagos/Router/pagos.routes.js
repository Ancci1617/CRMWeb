"use strict";
const Router = require("express").Router();
const { deudaCte, cargarPago, cambiarFecha,codigoDePago } = require("../controller/pagos.controller.cargar_pago.js");




Router.get("/deuda_cte",  deudaCte);
Router.get("/codigo_pago", codigoDePago);
Router.post("/cargar_pago", cargarPago);
Router.post("/cambio_de_fecha", cambiarFecha);







module.exports = Router;




