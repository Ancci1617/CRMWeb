const express = require("express");
const { isLoggedIn } = require("../lib/auth");
const Router = express.Router();


Router.get("/main", isLoggedIn, (req, res) => {
    res.render("main-menu");
});

Router.get("/", (req, res) => {
    res.redirect("/main");
});


module.exports = Router;