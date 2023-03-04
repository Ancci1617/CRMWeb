const Router = require("express").Router();
const { getMasterResumen } = require("../model/CRM/get_tablas/get_master");
const { isLoggedIn } = require("../lib/auth");


Router.post("/query_masterresumen", isLoggedIn, async (req, res) => {

    const CTE = req.body.CTE;
    const resumen = await getMasterResumen(CTE);
    res.json(resumen[0]);

})

module.exports = Router;
















