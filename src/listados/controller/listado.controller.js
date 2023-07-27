const pool = require("../../model/connection-database");
const fs = require("fs");
const path = require("path");
async function getListadoZonas(req, res) {

    try {
        const [zonas] = await pool.query("SELECT DISTINCT ZONA FROM Clientes where ZONA not in ('FZ') ORDER BY ZONA");
        console.log("zonas", zonas);
        res.render("listado/listado.zonas.ejs", { zonas });

    } catch (error) {
        console.error(error);
        res.send("Ocurrio un error al intentar cargar las zonas del listado")
    }

}

async function getListadoZona(req, res) {
    const { ZONA } = req.params;
    const { FILTRO } = req.query;

    if (!ZONA) return res.send("Zona no seleccionada");
    if (!FILTRO) return res.render("listado/listado.zona.ejs", { domicilios: [], ZONA });

    try {
        const query = fs.readFileSync(path.join(__dirname, "..", "model", "getDomicilios.sql"), "utf-8");
        const [domicilios] = await pool.query(query, [ZONA, `%${FILTRO}%`, ZONA, `%${FILTRO}%`]);

        res.render("listado/listado.zona.ejs", { domicilios, ZONA });
    } catch (error) {
        console.error(error);
        res.send(`Error al intentar cargar los domicilio del ${ZONA}`);
    }
}


async function resolucionRevisita(req, res) {
    const { ID, OBS = "", RESOLUCION } = req.body;
    if (!RESOLUCION || !ID) return res.send(`ERROR, CREDENCIALES NULAS ${JSON.stringify(req.body)}`);
    try {
        const [finalizar_revisita] = await pool.query("update Listado set ? where ?", [{ OBS, RESOLUCION, USUARIO: req.user.Usuario }, { ID }]);
        console.log("Revisita terminada: ", req.body);
    } catch (error) {
        console.error(error);
        return res.send(`Error al finalizar revisita ID:${ID}`);
    }
    res.redirect(req.headers.referer);
}



module.exports = { getListadoZonas, getListadoZona, resolucionRevisita }

