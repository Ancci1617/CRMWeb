const Router = require("express").Router();
const apiController = require("../controller/api.controller.js");


//req.query = ?CTE=8108
Router.get("/getCte",apiController.getCte);
Router.post("/getUbicacion",apiController.getUbicacion);
Router.get("/getCalificaciones",apiController.getCalificaciones);
Router.post("/getDisponible/:CTE",apiController.getCalificacion);


module.exports = Router