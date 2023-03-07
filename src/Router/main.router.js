const express = require("express");
const { isLoggedIn } = require("../lib/auth");
const Router = express.Router();


Router.get("/CRM", isLoggedIn, (req, res) => {
    
    res.render("CRM/CRM",{username : req.user.Usuario});

})

Router.get("/main", isLoggedIn ,(req,res)=> {
    res.render("main-menu",{user : req.user} )    
})

Router.get("/", (req,res)=>{
    res.redirect("/main")
})


module.exports = Router