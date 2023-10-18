const pool = require("../../connection-database.js");


//UNIFICAR ESTOS 2
const getArticulosString = async (articulos) => {
    //articutlos = ["34","35","36"]
    try {
        const [rows] = await pool.query(
            `SELECT Producto FROM LP WHERE Art IN (?);`, [articulos]);

        if (rows.length > 0) {
            let reduced = rows.reduce((acum, art) => acum + art.Producto + "-", "");
            return reduced.substring(0, reduced.length - 1);
        }
    } catch (error) {
        console.log("error al consultar articulos", error);
    }
    return "";
}


module.exports = { getArticulosString }