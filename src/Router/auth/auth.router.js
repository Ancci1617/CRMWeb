const Router = require("express").Router();
const passport = require("passport");
const { isLoggedIn, isNotLoggedIn } = require("../../lib/auth");


Router.get("/login", isNotLoggedIn ,(req, res) => {
    res.render("auth/login")
});

Router.post("/login", passport.authenticate('local', {
    successRedirect: "/main",
    failureRedirect: "/login"
}));

Router.get("/logout",isLoggedIn, (req,res)=>{

    req.logout(function(err) {
        if (err) { 
            console.log("ERROR EN LAS SESIONES",err);
            return res.redirect('/');
         }
        res.redirect('/');
      });

})





module.exports = Router;




