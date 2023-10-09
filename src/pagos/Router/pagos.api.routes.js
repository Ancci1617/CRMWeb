const Router = require("express").Router();
const { getCobranzas } = require("../controller/pagos.controller.cobranza.js");


Router.get("/get_cobranzas", getCobranzas);

module.exports = Router

