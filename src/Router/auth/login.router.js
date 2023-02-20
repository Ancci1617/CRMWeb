

const Router = require("express").Router()
const passport = require("../../lib/passport.lib")

Router.get("/login",(req,res)=>{
    res.render("auth/login")
})

Router.post("/login",passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect: "/login"
}))





module.exports = Router;




