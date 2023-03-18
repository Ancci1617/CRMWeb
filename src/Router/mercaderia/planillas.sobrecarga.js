const Router = require("express").Router();
const { isLoggedIn, isAdmin } = require("../../lib/auth");
const { insertSobreCarga,getPlanilla } = require("../../model/mercaderia/planilla")




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
    const response = await getPlanilla(VENDEDOR, FECHA);
    const sobrecarga = JSON.parse(response.SOBRECARGA);
    sobrecarga[ID].CONTROL = req.user.Usuario;

    await insertSobreCarga(JSON.stringify(sobrecarga), FECHA, VENDEDOR);

    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

})









module.exports = Router









