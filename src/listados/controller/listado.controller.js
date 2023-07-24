const pool = require("../../model/connection-database");

async function getListadoZonas(req, res) {

    try {
        const [zonas] = await pool.query("SELECT DISTINCT ZONA FROM Listado where ZONA not in ('FZ')");
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
    if (!FILTRO) return res.render("listado/listado.zona.ejs", { domicilios: [] ,ZONA });
    

    // {
    //     CTE: '6435',
    //     ZONA: 'A1',
    //     NOMBRE: 'MANCUELLO Maria de los Angeles',
    //     CALLE: 'F. L. Beltran 721',
    //     BGM: 'REVISAR',
    //     CALIF: 'NO VENDER REVISAR',
    //     CRUCES: 'Reconquista',
    //     CRUCES2: 'Peña',
    //     OBS: '',
    //     RESOLUCION: 'ACTIVO',
    //     USUARIO: '',
    //     ID: 279,
    //     TELEFONO: null
    //   }

    try {
        // //Aca deberia filtrar la resolucion de las zonas
        const [domicilios] = await pool.query(
            "SELECT DISTINCT L.`CTE`, L.`ZONA`, L.`NOMBRE`, L.`CALLE`, " +
            "MasterResumen.`BGM DISPONIBLE` as BGM, MasterResumen.CALIF as CALIF, " +
            "L.`CRUCES`, L.`CRUCES2`, L.`OBS`, L.`RESOLUCION`, L.`USUARIO`, L.`ID`, " +
            "(SELECT BC.TELEFONO FROM BaseCTE BC where BC.CTE = L.CTE and BC.VALIDACION = 'VALIDO'  " +
            "order by BC.ID DESC LIMIT 1) AS TELEFONO from Listado L " +
            "left join BaseCTE BC on BC.CTE = L.CTE left join MasterResumen on MasterResumen.Cliente = L.CTE  " +
            "where L.RESOLUCION = 'ACTIVO' AND L.ZONA = ? AND L.CALLE like ? ORDER BY L.CALLE ASC LIMIT 20"// "LIMIT 20; "
            , [ZONA, `%${FILTRO}%`]);

        // const [domicilios] = await pool.query(
        //     "SELECT `ZONA`, `Z` as CTE, `NOMBRE`, CONCAT(CALLE,' ',ALTURA) as CALLE, '1' as BGM ,'IMAN' as CALIF ,"+
        //     "'' as CRUCES,'' as CRUCES2,`ALTURA`, `TELEFONO`, `LINEA`, `DIA`, `VALIDACION`, `GRUPO_MENSAJE`, `ID` "+
        //     "FROM `BaseZ` where ZONA = ? and CALLE like ? order by ALTURA",[ZONA, `%${FILTRO}%`]);  
        
        res.render("listado/listado.zona.ejs", { domicilios, ZONA });
    } catch (error) {
        console.error(error);
        res.send(`Error al intentar cargar los domicilio del ${ZONA}`);
    }
}


async function resolucionRevisita(req,res){
    const {ID,OBS = "",RESOLUCION} = req.body;
    if(!RESOLUCION || !ID) return res.send(`ERROR, CREDENCIALES NULAS ${JSON.stringify(req.body)}`);
    try {
        const [finalizar_revisita] = await pool.query("update Listado set ? where ?",[{OBS,RESOLUCION,USUARIO : req.user.Usuario},{ID}]);
        console.log("Revisita terminada: " , req.body);
    } catch (error) {
        console.error(error);
        return res.send(`Error al finalizar revisita ID:${ID}`);
    }
    res.redirect(req.headers.referer);
}



module.exports = { getListadoZonas, getListadoZona ,resolucionRevisita}

