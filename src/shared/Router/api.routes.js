const Router = require("express").Router();
const api_controller = require("../controller/api.controller.js");


//req.query = ?CTE=8108
Router.get("/getCte",api_controller.getCte);




module.exports = Router