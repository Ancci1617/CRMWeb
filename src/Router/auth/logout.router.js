const express = require("express")
const Router = express.Router();
const pool = require("../../model/connection-database.js")
const { isNotLoggedIn, isLoggedIn } = require("../../lib/auth.js")

Router.get("/logOut", isLoggedIn, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("*************ERROR AL CERRAR SESION*************")
            console.log(err)
        }
    })
    res.redirect("/login")
})

module.exports = Router