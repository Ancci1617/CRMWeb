"use strict";
const Router = require("express").Router();
const cobradorController = require("../controller/cobrador.controller.js");

Router.get("/recorrido",cobradorController.formOrdenarRecorrido);
Router.post("/recorrido",cobradorController.postOrdenarRecorrido);




// Router.get("/recorrido2",(req,res) => {
//     res.render("cobrador/recorrido2.ejs")
// });





Router.post("/recorrido/ordenar",cobradorController.postOrdenarRecorrido)














module.exports = Router;



























