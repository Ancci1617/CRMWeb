var session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore(require("./connection-object.js"))

module.exports = session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    cookie:{maxAge:50000},
    saveUninitialized: false
})