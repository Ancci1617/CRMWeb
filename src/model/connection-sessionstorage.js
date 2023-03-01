try {


    var session = require('express-session');
    const MySQLStore = require('express-mysql-session')(session);
    const sessionStore = new MySQLStore(require("./connection-object"));
    module.exports = sessionStore;

} catch (error) {   
    console.log("Error generando sesiones en la base de datos");
}