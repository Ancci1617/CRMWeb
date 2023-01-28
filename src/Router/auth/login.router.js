const express = require("express")
const Router = express.Router();
const pool = require("../../model/connection-database.js")
const { isNotLoggedIn } = require("../../lib/auth.js")


Router.get("/login", isNotLoggedIn, (req, res) => {

    //res.render("auth/login")
    res.render("auth/login", { message: req.flash("no-success") })

})

//Logea en la sesion
Router.post("/login", async (req, res) => {
    //    const pool = await connection();
    const user = req.body.username;
    const pass = req.body.password;

    console.log(`por consultar ${user} ${pass}`)
    if (user && pass) {

        try {
            var [rows, fields] = await pool.query("SELECT * FROM accounts WHERE username = ? and password = ?", [user, pass])
        } catch (error) {
            req.flash("no-success", "Error en la base de datos interna")
            console.log("ERROR EN BASE DE DATOS: " + error)
            return res.redirect("/login")
        }

        if (rows.length > 0) {
            req.session.user = user
            req.session.isLoggedIn = true;
            return res.redirect("/")
        }
    }

    req.flash("no-success", "Datos incorrectos")
    return res.redirect("/login")
})


module.exports = Router