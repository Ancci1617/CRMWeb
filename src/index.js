const express = require('express');
const app = express();
const morgan = require("morgan");
const path = require("path");
const flash = require("connect-flash");
const session = require('express-session');
const passport = require("./lib/passport.lib")





//Set config
app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
    secret: "Secret code",
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge:30000}
}));

//Set Variables;
app.set("PORT", process.env.PORT || 3000);




//Middlewareas
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(require("./model/connection-session.js"));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());




//Routes
app.use(require("./Router/main.router"));
app.use(require("./Router/CRM/consulta.crm.router"));
app.use(require("./Router/auth/login.router"));






app.listen(app.get("PORT"), (err) => {
    if (err) {
        console.log("ERR: " + err);
    }
    console.log("Server running on port " + app.get("PORT"));
})



