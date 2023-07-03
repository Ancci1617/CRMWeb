const Router = require("express").Router();
const { getMasterResumen } = require("../model/CRM/get_tablas/get_master");
const { isLoggedIn } = require("../lib/auth");


Router.post("/query_masterresumen", isLoggedIn, async (req, res) => {
    console.log("MASTER RESUMEN , ",req.body);
    const {CTE} = req.body;

    const resumen = await getMasterResumen(CTE);
    res.json(resumen[0]);

})

module.exports = Router;
















