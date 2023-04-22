const Router = require("express").Router();
const { isLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const { getStockDeposito, getRandomControl, getVigentes } = require("../../model/mercaderia/deposito");

const { insertarControlDeUnidades, getControlesHistorial,getFechasHistorialControles, getMovimientosGeneralesFiltro, getMovimientosTodasUnidades } = require("../../model/mercaderia/camionetas/camionetas.model");

//Menu
Router.get("/stock", isLoggedIn, isAdmin, async (req, res) => {
    const data = { title: "Stock", items: ["Deposito", "Controles"], links: ["/stock/deposito", "stock/deposito_controles"] };
    res.render("list-items.ejs", { data });
})


//Deposito
Router.get("/stock/deposito", isLoggedIn, isAdmin, async (req, res) => {
    const stock = await getStockDeposito();
    const fechas = await getFechasHistorialControles('BGM');
    const movimientos = await getMovimientosTodasUnidades();
    res.render("mercaderia/stock.deposito.ejs", { stock, fechas, movimientos });

});
//Controles
Router.get("/stock/deposito_controles", isLoggedIn, isAdmin, async (req, res) => {

    const para_control = await getRandomControl();
    res.render("mercaderia/deposito.controles.ejs", { para_control });

});

Router.post("/stock/insertar_deposito_control", isLoggedIn, isAdmin, async (req, res) => {

    const { body } = req;
    const { Usuario } = req.user;
    const FECHA = new Date(new Date() - 1000 * 60 * 60 * 3).toISOString().split("T")[0];
    const HORA = new Date(new Date() - 1000 * 60 * 60 * 3).toISOString().split("T")[1].substring(0, 5);

    const body_ordered = body.sort((x, y) => x.ART.localeCompare(y.ART));
    const arts = body.map(e => e.ART);

    const vigentes = await getVigentes(arts);

    const submit_object = [];
    for (let i = 0; i < arts.length; i++) {
        let cantidad = body_ordered[i].CONTROL ? parseInt(body_ordered[i].CONTROL) : 0;
        let VIGENTE = vigentes[i].VIGENTE ? vigentes[i].VIGENTE : 0;
        submit_object.push(Object.assign(body_ordered[i], { VIGENTE }, { DIFERENCIA: cantidad - VIGENTE }));
    }

    const submit_array = [];
    submit_object.forEach(art => {
        submit_array.push(
            ['BGM', Usuario, art.ART, art.VIGENTE, art.CONTROL, art.DIFERENCIA, FECHA, HORA]);
    });

    await insertarControlDeUnidades(submit_array);

    res.json({ cargado: true, msg: "Control cargado!" });

});


Router.post("/stock/consultar_controles", isLoggedIn, isAdmin, async (req, res) => {

    const { UNIDAD,FECHAHORA } = req.body;

    const movimientos = await getControlesHistorial(UNIDAD,FECHAHORA);

    res.json(movimientos);

});

Router.post("/stock/consultar_movimientos_generales", isLoggedIn, isAdmin, async (req, res) => {

    const { FILTRO } = req.body;

    const movimientos = await getMovimientosGeneralesFiltro(FILTRO);

    res.json(movimientos);

});


module.exports = Router



