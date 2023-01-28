const express = require("express")
const Router = express.Router();
const pool = require("../../model/connection-database.js")

Router.post("/clientes", async (req, res) => {
    console.log(req.body)

    const [rows] = await pool.query(
        "SELECT " +
        "`CTE`, `APELLIDO Y NOMBRE`," +
        "`ZONA`, `CALLE`, `CRUCES`, `CRUCES2`," +
        "`WHATS APP`, `DNI`, `Master`, `OBS` FROM `Clientes` " +
        "WHERE `CTE` = ? LIMIT 1;", [req.body.CTE]);


    if (rows.length > 0) {
        return res.status(200).json(rows);
    }

    return res.status(404).json([{ "CTE": "not found" }]);
})

Router.post("/ping", async (req, res) => {

    res.send("pong")

})
Router.get("/a", (req, res) => {
    res.json({ "A": "A" })
})
module.exports = Router