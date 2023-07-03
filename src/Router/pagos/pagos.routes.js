"use strict";
const Router = require("express").Router();


Router.get("/cargar_pago/",(req,res)=>{
    const {DATA,TIPO} = req.params;

    //Solo con CTE
    const CTE = {CTE : 8108};
    const CREDITOS = [{FICHA : 9254, DEUDA_CUO : 10000 }];


    res.render("pagos/pagos.cargar.ejs",{CTE,CREDITOS});

});



module.exports = Router;




