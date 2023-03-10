const express = require('express');
const app = express();
const morgan = require("morgan");
const path = require("path");
const flash = require("connect-flash");
const session = require('express-session');
const passport = require("passport")
const {poolConfig} = require("./model/connection-config.js");

//Comentario final

//Set config
app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');




//Set Variables;
app.set("PORT", process.env.PORT || 3000);




//Middlewareas
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: require("./model/connection-sessionstorage"),
    resave: false,
    cookie: { maxAge: (1000 * 60 * 60 * 10) },
    saveUninitialized: false
}));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
require("./lib/passport.lib");



//Routes
app.use(require("./Router/main.router"));
app.use(require("./Router/CRM/consulta.crm.router"));
app.use(require("./Router/auth/auth.router"));
app.use(require('./Router/ventas/ventas.router'))
app.use(require("./Router/get.router"));
app.use(require("./Router/mercaderia/planillas.router.js"));



//Ejecuta el servidor
app.listen(app.get("PORT"),async (err) => {
    //Configura el lenguaje de la sesion en las fechas
    await poolConfig();

    if (err) {
        console.log("ERR: " + err);
    }
    console.log("Server running on port, " + app.get("PORT"));
})



