const Router = require("express").Router();
const { isLoggedIn, isNotLoggedIn, isAdmin } = require("../../lib/auth");
const { getVendedores, getFechaDeVentas } = require("../../model/ventas/ventas.query");
const {getArchivoDeEntregaVentas,getArchivoDeEntregaAccess} = require("../../model/ventas/archivo_de_entrega");



Router.get("/archivo_de_entrega",isLoggedIn,isAdmin,async (req,res)=> {

    const vendedores = await getVendedores();
    const fechas = await getFechaDeVentas();
    
    res.render("ventas/Ventas.archivos.ejs",{ vendedores, fechas });

});

Router.post("/archivo_de_entrega_ventas",isLoggedIn,isAdmin,async(req,res)=> {
    let body = req.body;
    const ventas = await getArchivoDeEntregaVentas(body.VENDEDOR,body.FECHA);
    res.json(ventas);    
});
Router.post("/archivo_de_entrega_access",isLoggedIn,isAdmin,async(req,res)=> {
    let body = req.body;
    const ventas = await getArchivoDeEntregaAccess(body.VENDEDOR,body.FECHA);
    res.json(ventas);   

});






module.exports = Router;
