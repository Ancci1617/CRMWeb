const Router = require("express").Router();

Router.get("/mis_planillas",(req,res)=>{
    res.render("mercaderia/mis.planillas");
    
});




module.exports = Router;