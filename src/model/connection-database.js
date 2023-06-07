const mysql = require("mysql2")
const objConnection = require("./connection-object.js")


try {    
    
    const pool = mysql.createPool(objConnection);
    
    module.exports = pool.promise();


} catch (error) {

    console.log("ERROR EN  MODEL/CONNECTION-DATABASE");
    console.log(error);

}

// export async function connect(){

//     // If the pool was already created, return it instead of creating a new one.
//     if(typeof globalPool !== 'undefined') {
//       return globalPool;
//     }
  
//     // If we have gotten this far, the pool doesn't exist, so lets create one.
//     globalPool = await mysql.createPool({
//       host: 'localhost',
//       port: 3306,
//       user: 'root',
//       password: '',
//       database: 'mendozarq',
//       connectionLimit: 10
//     });
//     return globalPool;
//   }



