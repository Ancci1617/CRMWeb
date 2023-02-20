const express = require("express")
const Router = express.Router();


Router.get("/", (req, res) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login")
    }

    res.render("CRM/CRM");

})




module.exports = Router