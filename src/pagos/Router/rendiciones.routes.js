"use strict";

const Router = require("express").Router();
const {rendicionReceptor,generarRendicion,cargarEfectivo,updateEditable,cargarGasto,borrarGasto} = require("../controller/rendicion.controller.js")




Router.get("/rendicion_receptor", rendicionReceptor);
Router.get("/generar_rendicion", generarRendicion);
Router.get("/borrar_gasto",borrarGasto)
Router.post("/cargar_efectivo",cargarEfectivo);
Router.post("/cambiar_editable",updateEditable);
Router.post("/cargar_gasto",cargarGasto);




module.exports = Router;