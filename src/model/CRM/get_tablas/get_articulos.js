const pool = require("../../connection-database.js");


//UNIFICAR ESTOS 2
const getArticulosString = async (articulos) => {
    //articutlos = ["34","35","36"]
    try {
        const [rows] = await pool.query(
            `SELECT Producto,Art FROM LP WHERE Art IN (?);`, [articulos]);

        if (rows.length > 0) {

            const reduced = articulos.reduce((acum, art) => {
                const foundArt = rows.find(row => row.Art == art) || { Producto: "No encontrado" };

                return acum + foundArt.Producto + " | "

            }, "");
            return reduced.substring(0, reduced.length - 1);

        }



    } catch (error) {
        console.log("error al consultar articulos", error);
    }
    return "";
}


module.exports = { getArticulosString }