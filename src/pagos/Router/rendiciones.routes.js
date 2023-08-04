"use strict";

const Router = require("express").Router();
const {rendicionReceptor,generarRendicion,cargarEfectivo,updateEditable} = require("../controller/rendicion.controller.js")




Router.get("/rendicion_receptor", rendicionReceptor);
Router.get("/generar_rendicion", generarRendicion);
Router.post("/cargar_efectivo",cargarEfectivo);
Router.post("/cambiar_editable",updateEditable);



module.exports = Router;