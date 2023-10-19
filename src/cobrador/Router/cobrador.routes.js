"use strict";
const Router = require("express").Router();
const cobradorController = require("../controller/cobrador.controller.js");

Router.get("/recorrido",cobradorController.formOrdenarRecorrido);
Router.get("/recorrido/:ZONA",cobradorController.formIniciarRecorrido);




Router.post("/recorrido",cobradorController.postOrdenarRecorrido);
Router.post("/cambiarFecha",cobradorController.postCambiarFecha);
Router.get("/volver",cobradorController.postVolver);

// Router.get("/recorrido2",(req,res) => {
//     res.render("cobrador/recorrido2.ejs")
// });





Router.post("/recorrido/ordenar",cobradorController.postOrdenarRecorrido)














module.exports = Router;



























