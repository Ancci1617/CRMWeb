const Router = require("express").Router();
const { getCobranzas, getCobranzasEasy } = require("../controller/pagos.controller.cobranza.js");


Router.get("/get_cobranzas", getCobranzas);
Router.get("/get_cobranzasEasy", getCobranzasEasy);


module.exports = Router

