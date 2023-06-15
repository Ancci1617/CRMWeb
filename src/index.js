const express = require('express');
const app = express();
const morgan = require("morgan");
const path = require("path");
const flash = require("connect-flash");
const session = require('express-session');
const passport = require("passport")
const { poolConfig } = require("./model/connection-config.js");
const { userView } = require("./middlewares/user.middlewares.js");
const fileUpload = require('express-fileupload');
const { isLoggedIn } = require('./lib/auth.js');



//Set config
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));






//Set Variables;
app.set("PORT", process.env.PORT || 3000);



//Middlewareas
app.use(fileUpload())
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: require("./model/connection-sessionstorage"),
    resave: false,
    cookie: { maxAge: (1000 * 60 * 60 * 10) },
    saveUninitialized: false
}));
// app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(userView);
require("./lib/passport.lib");

morgan.token('user', function (req, res) { return req.user? req.user.Usuario  : "WL"});
app.use(morgan(":method :url :status :response-time ms - :res[content-length] - :user"));


//Routes
app.use(require("./Router/auth/auth.router"));
app.use(require("./Router/main.router"));
app.use(require("./Router/CRM/consulta.crm.router"));
app.use(require("./Router/ventas/ventas.router"))
app.use(require("./Router/ventas/ventas.archivos.js"))
app.use(require("./Router/get.router"));
app.use(require("./Router/mercaderia/planillas.sobrecarga.js"));
app.use(require("./Router/mercaderia/planillas.router.js"));
app.use(require("./Router/mercaderia/camionetas/camionetas.router.js"));
app.use(require("./Router/mercaderia/deposito.router.js"));
app.use(require("./Router/ventas/contado/contado.router.js"));
app.use(require("./Router/ventas/dnis/dnis.router.js"));
app.use(isLoggedIn, require("./Router/pedidos/pedidos.router.js"));
app.use(require("./Router/contactos/contactos.router.js"));
// morgan.token('usuario', (req, res) => { return req.user? req.user.Usuario : "WL"});
// app.use(morgan(()=> {return ':method :url :status :response-time ms - :res[content-length] - :user'}));
// app.use((req,res) => {res.send("default")})

//




//Ejecuta el servidor
app.listen(app.get("PORT"), async (err) => {
    //Configura el lenguaje de la sesion en las fechas
    // await poolConfig();

    if (err) console.log("ERR: " + err);

    console.log("Server running on port, " + app.get("PORT"));
})


//Ejecuta el servidor
app.listen(80, async (err) => {
    //Configura el lenguaje de la sesion en las fechas
    // await poolConfig();

    if (err) console.log("ERR: " + err);

    console.log("Server running on port, " + 80);
})



