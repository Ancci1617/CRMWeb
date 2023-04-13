const Router = require("express").Router();
const { isLoggedIn, isAdmin, isAdminOrVendedor } = require("../../../lib/auth");


Router.get("/cargas_camionetas", isLoggedIn, isAdminOrVendedor, async (req, res) => {


    if (req.user.RANGO == "ADMIN")
        return res.render("mercaderia/camionetas/lista_de_camionetas.ejs");
    

    const camioneta_vendedor = "AB717" //CONVERTIR EN CONSULTA
    res.redirect(`/cargas_camionetas/${camioneta_vendedor}`);


});


Router.get("/cargas_camionetas/:CAMIONETA", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    
    

    res.send("camioneta")

});




module.exports = Router
