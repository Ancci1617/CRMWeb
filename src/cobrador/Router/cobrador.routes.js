"use strict";
const Router = require("express").Router();
const cobradorController = require("../controller/cobrador.controller.js");

Router.get("/recorrido",(req,res) => {


    
    res.render("cobrador/recorrido.ejs")

});
Router.get("/recorrido2",(req,res) => {
    res.render("cobrador/recorrido2.ejs")
});





Router.post("/recorrido/ordenar",cobradorController.postOrdenarRecorridoCobrador)














module.exports = Router;



























