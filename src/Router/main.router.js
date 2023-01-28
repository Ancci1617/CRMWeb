const express = require("express")
const Router = express.Router();
const { isLoggedIn } = require("../lib/auth.js")


Router.get("/", (req, res) => {
    res.render("CRM")

})




module.exports = Router