const express = require('express');
const app = express();
const morgan = require("morgan")
const path = require("path")
const flash = require("connect-flash")

//Set options
app.use(express.static(path.join(__dirname, 'public')))
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs')


//Set Variables
app.set("PORT", 3000)


//Middlewareas
app.use(morgan("dev"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(require("./model/connection-session.js"))
app.use(flash())


//Routes
app.use(require("./Router/main.router"))
app.use(require("./Router/auth/login.router"))
app.use(require("./Router/auth/logout.router"))
app.use(require("./Router/query/consulta.cte"))

app.listen(app.get("PORT"), (err) => {
    if (err) {
        console.log("ERR: " + err)
    }
    console.log("Server running on port " + app.get("PORT"))
})

