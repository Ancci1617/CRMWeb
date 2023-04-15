"use strict";
const Router = require("express").Router();
const { isLoggedIn, isAdmin } = require("../../lib/auth");
const { getUserByUsuario } = require("../../model/auth/getUser");
const { insertSobreCarga, getPlanilla, cargarStockPlanilla } = require("../../model/mercaderia/planilla");




Router.post("/sobrecarga", isLoggedIn, async (req, res) => {

    const { CTE, FICHA, ART, CARGA, TIPO, OBS, FECHA, VENDEDOR } = req.body;
    const response = await getPlanilla(VENDEDOR, FECHA);
    const nueva_sobrecarga = { CTE, FICHA, ART, CARGA, TIPO, OBS, CONTROL: "No confirmado" };
    const sobrecarga = JSON.parse(response.SOBRECARGA);
    sobrecarga.push(nueva_sobrecarga);
    
    await insertSobreCarga(JSON.stringify(sobrecarga), FECHA, VENDEDOR);

    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

});

Router.get("/mis_planillas/:FECHA/:VENDEDOR/confirmar_sobrecarga/:ID", isLoggedIn, isAdmin, async (req, res) => {
    const { VENDEDOR, FECHA, ID } = req.params;
    const { Usuario } = req.user;
    const response = await getPlanilla(VENDEDOR, FECHA);

    //CONFIRMA LA SOBRECARGA
    const SOBRECARGA = JSON.parse(response.SOBRECARGA);
    SOBRECARGA[ID].CONTROL = Usuario;
    await insertSobreCarga(JSON.stringify(SOBRECARGA), FECHA, VENDEDOR);

    //INSERTA EN STOCK ESTA SOBRECARGA CONFIRMADA
    const { CTE, FICHA, ART, CARGA, CONTROL,TIPO } = SOBRECARGA[ID];

    
    const efecto = CARGA == "Cargado" ? -1 : CARGA == "Descargado" ? 1 : 0;
    const articulos = [[
        response.UNIDAD, CTE, FICHA, ART, VENDEDOR,
        Usuario, TIPO,
        CARGA, CONTROL, CARGA,
        FECHA, efecto, "SOBRECARGA", efecto * -1
    ]];

    await cargarStockPlanilla(articulos);





    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

})









module.exports = Router









