const Router = require("express").Router();
const { isLoggedIn } = require("../../lib/auth");
const { getPlanillaDeCarga } = require("../../model/mercaderia/planilla")


Router.get("/mis_planillas", isLoggedIn, (req, res) => {
    res.render("mercaderia/mis-planillas.ejs", { user: req.user });
})



Router.get("/mis_planillas/planilla_de_carga", isLoggedIn, async (req, res) => {
    planilla_object = { RESUMEN: {}, ARTICULOS: [] };


    const response = await getPlanillaDeCarga(req.query.VENDEDOR, req.query.FECHA);
    planilla_object.RESUMEN.VENDEDOR = req.query.VENDEDOR;
    planilla_object.RESUMEN.FECHA = req.query.FECHA;
    planilla_object.RESUMEN.UNIDAD = "AB717";


    //ITERA CADA UNA DE LAS VENTAS DE AYER
    for (let i = 0; i < response.length; i++) {
        //GENERA UN ARRAY CON LLOS ARTICULOS
        let arts = response[i].ARTICULOS.split(" ");
        //POR CADA ARTICULOS INSERTA UN OBJETO EN EL ARRAY DE ARTICULOS
        for (let j = 0; j < arts.length; j++) {
            planilla_object.ARTICULOS.push({
                CTE: response[i].CTE,
                FICHA: response[i].FICHA,
                ANT: response[i].ANTICIPO,
                ESTATUS: response[i].ESTATUS,
                ART: arts[j]
            });
        };
    }



    res.render("mercaderia/planilla.ejs", { user: req.user, planilla_object });

});




module.exports = Router
