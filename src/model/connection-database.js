const mysql = require("mysql2/promise")
const objConnection = require("./connection-object.js")


try {    
        
    const pool = mysql.createPool(objConnection);

    module.exports = pool;


} catch (error) {

    console.log("ERROR EN  MODEL/CONNECTION-DATABASE");
    console.log(error);

}





