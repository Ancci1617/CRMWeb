const Router = require("express").Router();
const pool = require("../../model/connection-database.js")
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes")
const { getFichas } = require("../../model/CRM/get_tablas/get_fichas")
const { getCliente } = require("../../lib/get_cliente");
const { getPrestamos } = require("../../model/CRM/get_tablas/get_prestamos.js");
const { getMasterBGM, getMasterEC, getMasterResumen } = require("../../model/CRM/get_tablas/get_master.js");
const { getDomicilio } = require("../../model/CRM/get_tablas/get_domicilio.js");
const { isLoggedIn } = require("../../lib/auth");
const { guardar_respuesta_crm } = require("../../model/CRM/guardar-consulta.js");
const express = require("express");
const path = require("path");


Router.use(isLoggedIn, express.static(path.join("..", "ImagenesDeClientes")));


Router.get("/CRM", isLoggedIn, (req, res) => {
    const CTE = req.query.CTE;
    res.render("CRM/CRM.ejs", {CTE});
});


Router.post("/query_CRM", isLoggedIn, async (req, res) => {

    const query_result = {};

    //cte tiene que ser = al resultado de una funcion que busque el cliente en funcion del dato
    //Si getCTE(req.body) = -1  corta el algoritnmo, caso contrario continua la consulta
    const cte_data = await getCliente(req.body);
    const cte = cte_data.CTE;
    const hora = new Date(new Date().getTime() - 1000 * 60 * 60 * 3).toISOString().substring(0, 19);


    // if(memo[cte]) return res.json(memo[cte]);
    if (cte === -1) {
        guardar_respuesta_crm(req.user.Usuario, JSON.stringify(req.body), JSON.stringify({ CTE: "No encontrado" }), hora);
        return res.json({ "Clientes": [{ CTE: -1 }] });
    }

    query_result.Clientes = await getClientes(cte);
    query_result.Fichas = await getFichas(cte);
    query_result.Prestamos = await getPrestamos(cte);
    query_result.MasterBGM = await getMasterBGM(cte);
    query_result.MasterEC = await getMasterEC(cte);
    query_result.Disponible = await getMasterResumen(cte);
    query_result.Domicilio = await getDomicilio(cte_data.CALLE);

    // memo[cte] = query_result;
    //Appendiarlo junto a la data que va a ser respondida


    guardar_respuesta_crm(req.user.Usuario, JSON.stringify(req.body), JSON.stringify(query_result), hora);


    res.json(query_result);
})




module.exports = Router