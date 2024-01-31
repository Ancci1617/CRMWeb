const express = require('express');
const app = express();
const morgan = require("morgan");
const path = require("path");
const flash = require("connect-flash");
const session = require('express-session');
const passport = require("passport")
const { userView } = require("./middlewares/user.middlewares.js");
const fileUpload = require('express-fileupload');
const { isLoggedIn } = require('./lib/auth.js');
const fs = require("fs");
const https = require('https');
const config = require("config")



//Set Variables;
app.set("PORT", process.env.PORT || 3000);
global.dir_views = path.join(__dirname,"views");
global.dir_partials = path.join(__dirname,"views","partials");



//Set config
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));




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

morgan.token('user', function (req, res) { return req.user ? req.user.Usuario : "WL" });
app.use(morgan(":method :url :status :response-time ms - :res[content-length] - :user"));


// Routes
app.use("/mp/api/",require("./MP/Router/api.mp.routes.js"));


app.use("/api/pagos",require("./pagos/Router/pagos.api.routes.js"));

app.use(require("./Router/auth/auth.router"));
app.use(require("./Router/main.router"));
app.use(require("./Router/CRM/consulta.crm.router"));
app.use(require("./Router/ventas/ventas.router"))
app.use("/ventas/prestamos",require("./ventas/Router/ventas.easy.routes.js"));
app.use(require("./Router/ventas/ventas.archivos.js"))
app.use(require("./Router/get.router"));
app.use(require("./Router/mercaderia/planillas.sobrecarga.js"));
app.use(require("./Router/mercaderia/planillas.router.js"));
app.use(require("./Router/mercaderia/camionetas/camionetas.router.js"));
app.use(require("./Router/mercaderia/deposito.router.js"));
app.use(require("./Router/ventas/contado/contado.router.js"));
app.use("/dnis/",isLoggedIn,require("./Router/ventas/dnis/dnis.router.js"));
app.use(require("./Router/pedidos/pedidos.router.js"));
app.use(require("./Router/contactos/campania.router.js"));
app.use(require("./Router/contactos/contactos.router.js"));

app.use("/LP",require("./precios/routes/precios.routes.js"))

app.use("/admin/",isLoggedIn,require("./admin/routes/admin.routes.js"));
app.use("/mp/api/",isLoggedIn,require("./MP/Router/api.mp.routes.js"));
app.use("/api/",isLoggedIn,require("./shared/Router/api.routes.js"));
app.use("/mp/",isLoggedIn,require("./MP/Router/mp.routes.js"));
app.use("/pagos/", isLoggedIn, require("./pagos/Router/pagos.routes.js"));
app.use("/listado/", isLoggedIn, require("./listados/Router/listado.routes.js"));
app.use("/rendicion/", require("./pagos/Router/rendiciones.routes.js"));
app.use("/ventas/",isLoggedIn,require("./ventas/Router/ventas.routes.js"));
app.use("/cobrador/",isLoggedIn,require("./cobrador/Router/cobrador.routes.js"));
// app.use("/rendiciones/",require("./pagos/Router/rendiciones.routes.js"));

// morgan.token('usuario', (req, res) => { return req.user? req.user.Usuario : "WL"});
// app.use(morgan(()=> {return ':method :url :status :response-time ms - :res[content-length] - :user'}));
// app.use((req,res) => {res.send("default")})


const privateKey = fs.readFileSync(path.join(__dirname, "..", "..", "certificados", 'blancogusmar.com.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, "..", "..", "certificados", 'blancogusmar.com.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate, ca: [fs.readFileSync(path.join(__dirname, "..", "..", "certificados", 'SectigoRSADomainValidationSecureServerCA.crt'), 'utf8')] };
// const credentials = { key: privateKey, cert: certificate};


// Configurar rutas y middleware de Express aquí
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.get("PORT"), () => {

    console.log(`Server running on port, ${config.get("PORT")}`);
    console.log(`Servidor activo en modo de ${config.get("MODO")}`);
});


app.listen(4000, () => {
    console.log('Server running on port, 4000');

})


