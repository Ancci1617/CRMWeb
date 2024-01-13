const Router = require("express").Router();
const path = require("path");
const fs = require("fs/promises");
const { saveFileFromEntry } = require("../../../lib/files");
const { hasPermission } = require("../../../middlewares/permission.middleware.js");
const permisos = require("../../../constants/permisos.js");
const { getListadoDeNumerosDeClientes } = require("../../../shared/model/ClientesSV.model.js");


Router.get("/", hasPermission(permisos.DNI_USER), async (req, res) => {

    const clientes = await getListadoDeNumerosDeClientes();
    const links = clientes.map(cte => `/dnis/cargar_imagen/${cte.CTE}`);
    const items = clientes.map(cte => cte.CTE);
    const data = { title: "Dnis", items, links };
    res.render("list-items.ejs", { data });
});

Router.get("/cargar_imagen/:CTE", hasPermission(permisos.DNI_USER), async (req, res) => {
    const { CTE } = req.params;
    res.render("ventas/dnis/dnis.visualizar.ejs", { CTE });
});

Router.post("/cargar_imagen/:CTE", async (req, res) => {
    if (!req.files) return res.send("Archivos no enviados");

    const { CTE } = req.params;
    const entries = Object.entries(req.files);
    saveFileFromEntry(entries, CTE);
    res.redirect(`/dnis/cargar_imagen/${CTE}`);
});

Router.get("/eliminar_imagen/", async (req, res) => {
    const { CTE, IMAGEN } = req.query;
    if (!CTE || !IMAGEN) return res.status(400).send("Parametros incorrectos.");
    try {
        await fs.unlink(`../ImagenesDeClientes/${CTE}/CTE-${CTE}-${IMAGEN}.jpg`);
    } catch (error) {
        console.log(error);
        return res.send("No se encontro la imagen para eliminar");
    }
    res.redirect(`/dnis/cargar_imagen/${CTE}`);

});



module.exports = Router;


