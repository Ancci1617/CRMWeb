const pool = require("../../model/connection-database");

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
    if (!FILTRO) return res.render("listado/listado.zona.ejs", { domicilios: [] ,ZONA });
    

    // {
    //     CTE: '6435', CTE:'Z12312' //Lo mismo
    //     ZONA: 'A1', ZONA : 'A1' //Lo mismo
    //     NOMBRE: 'MANCUELLO Maria de los Angeles',  //Lo mismo
    //     CALLE: 'F. L. Beltran 721'(DeAccess), (Concat(Calle, altura) de BaseZ) 
    //     BGM: 'REVISAR', //Siempre lo mismo
    //     CALIF: 'NO VENDER REVISAR',
    //     CRUCES: 'Reconquista',
    //     CRUCES2: 'Peña',
    //     
    //     RESOLUCION: 'ACTIVO',
    //     USUARIO: '',
    //     ID: 279,
    //     TELEFONO: null
    //   }

    try {
        // //Aca deberia filtrar la resolucion de las zonas
        // const [domicilios] = await pool.query(
        //     "SELECT DISTINCT L.`CTE`, L.`ZONA`, L.`NOMBRE`, L.`CALLE`, " +
        //     "MasterResumen.`BGM DISPONIBLE` as BGM, MasterResumen.CALIF as CALIF, " +
        //     "L.`CRUCES`, L.`CRUCES2`, L.`OBS`, L.`RESOLUCION`, L.`USUARIO`, L.`ID`, " +
        //     "(SELECT BC.TELEFONO FROM BaseCTE BC where BC.CTE = L.CTE and BC.VALIDACION = 'VALIDO'  " +
        //     "order by BC.ID DESC LIMIT 1) AS TELEFONO from Listado L " +
        //     "left join BaseCTE BC on BC.CTE = L.CTE left join MasterResumen on MasterResumen.Cliente = L.CTE  " +
        //     "where L.RESOLUCION = 'ACTIVO' AND L.ZONA = ? AND L.CALLE like ? ORDER BY L.CALLE ASC LIMIT 20"
        //     , [ZONA, `%${FILTRO}%`]);

        // const [domicilios] = await pool.query(
        //     "SELECT `ZONA`, `Z` as CTE, `NOMBRE`, CONCAT(CALLE,' ',ALTURA) as CALLE, '1' as BGM ,'IMAN' as CALIF ,"+
        //     "'' as CRUCES,'' as CRUCES2,`ALTURA`, `TELEFONO`, `LINEA`, `DIA`, `VALIDACION`, `GRUPO_MENSAJE`, `ID` "+
        //     "FROM `BaseZ` where ZONA = ? and CALLE like ? order by ALTURA",[ZONA, `%${FILTRO}%`]);  

        // (SELECT BC.TELEFONO FROM BaseCTE BC where BC.CTE = L.CTE and BC.VALIDACION = 'VALIDO'  order by BC.ID DESC LIMIT 1)
        //     
        
        const [domicilios] = await pool.query(
        "SELECT DISTINCT Listado.CTE,C.ZONA,C.`APELLIDO Y NOMBRE` as NOMBRE,  " + 
        "C.CALLE,MR.`BGM DISPONIBLE` AS BGM,MR.CALIF as CALIF,C.CRUCES,C.CRUCES2, " +
        "Listado.RESOLUCION,Listado.USUARIO,Listado.ID,(SELECT BC.TELEFONO FROM BaseCTE BC where BC.CTE = Listado.CTE and BC.VALIDACION = 'VALIDO' order by BC.ID DESC LIMIT 1) AS TELEFONO FROM `Listado` " +
        "LEFT JOIN Clientes C on C.CTE = Listado.CTE LEFT join MasterResumen MR on MR.Cliente = Listado.CTE " +
        "where Listado.CTE NOT LIKE '%Z%' AND Listado.RESOLUCION = 'ACTIVO' " + 
        "AND C.ZONA = ? AND C.CALLE like ? " +

        "union " +

        "SELECT DISTINCT Listado.CTE,BaseZ.ZONA,BaseZ.NOMBRE,CONCAT(BaseZ.CALLE,' ', BaseZ.ALTURA), " +
        "'IMAN' AS BGM,'1' AS CALIF,'' AS CRUCES,'' AS CRUCES2 , " + 
        "Listado.RESOLUCION,Listado.USUARIO,Listado.ID,BaseZ.TELEFONO FROM Listado " +
        "LEFT JOIN BaseZ on BaseZ.Z = Listado.CTE where Listado.CTE like '%Z%'  " + 
        "AND BaseZ.ZONA = ? AND BaseZ.CALLE like ? ORDER BY CALLE limit 40" 
         , [ZONA,`%${FILTRO}%`,ZONA,`%${FILTRO}%`])

        console.log("domicilios",domicilios);

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

