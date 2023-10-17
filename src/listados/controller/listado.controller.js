const pool = require("../../model/connection-database");
const path = require("path");
const {getToday} = require("../../lib/dates.js");
async function getListadoZonas(req, res) {

    try {
        const [zonas] = await pool.query("SELECT DISTINCT ZONA FROM ClientesSV where ZONA not in ('FZ') ORDER BY ZONA");
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
        
        const [domicilios] = await pool.query(
        "SELECT DISTINCT Listado.CTE,C.ZONA,C.NOMBRE,  " + 
        "C.CALLE,MR.`BGM DISPONIBLE` AS BGM,MR.CALIF as CALIF,C.CRUCES,C.CRUCES2, " +
        "Listado.RESOLUCION,Listado.USUARIO,Listado.ID,(SELECT BC.TELEFONO FROM BaseCTE BC where BC.CTE = Listado.CTE and BC.VALIDACION = 'VALIDO' order by BC.ID DESC LIMIT 1) AS TELEFONO FROM `Listado` " +
        "LEFT JOIN ClientesSV C on C.CTE = Listado.CTE LEFT join MasterResumen MR on MR.Cliente = Listado.CTE " +
        "where Listado.CTE NOT LIKE '%Z%' AND Listado.RESOLUCION = 'ACTIVO' " + 
        "AND C.ZONA = ? AND C.CALLE like ? " +

        "union " +

        "SELECT DISTINCT Listado.CTE,BaseZ.ZONA,BaseZ.NOMBRE,CONCAT(BaseZ.CALLE,' ', BaseZ.ALTURA), " +
        "'IMAN' AS BGM,'1' AS CALIF,'' AS CRUCES,'' AS CRUCES2 , " + 
        "Listado.RESOLUCION,Listado.USUARIO,Listado.ID,BaseZ.TELEFONO FROM Listado " +
        "LEFT JOIN BaseZ on BaseZ.Z = Listado.CTE where Listado.CTE like '%Z%'  AND Listado.RESOLUCION = 'ACTIVO'  " + 
        "AND BaseZ.ZONA = ? AND BaseZ.CALLE like ? ORDER BY CALLE limit 35" 
         , [ZONA,`%${FILTRO}%`,ZONA,`%${FILTRO}%`])


        res.render("listado/listado.zona.ejs", { domicilios, ZONA });
    } catch (error) {
        console.error(error);
        res.send(`Error al intentar cargar los domicilio del ${ZONA}`);
    }
}


async function resolucionRevisita(req, res) {
    const { ID, OBS = "", RESOLUCION } = req.body;
    const FECHA = getToday();
    
    if (!RESOLUCION || !ID) return res.send(`ERROR, CREDENCIALES NULAS ${JSON.stringify(req.body)}`);
    try {
        const [finalizar_revisita] = await pool.query("update Listado set ? where ?", [{ OBS, RESOLUCION, USUARIO: req.user.Usuario,FECHA }, { ID }]);
        console.log("Revisita terminada: ", req.body);
    } catch (error) {
        console.error(error);
        return res.send(`Error al finalizar revisita ID:${ID}`);
    }
    res.redirect(req.headers.referer);
}



module.exports = { getListadoZonas, getListadoZona, resolucionRevisita }

