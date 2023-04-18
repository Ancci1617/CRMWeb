const Router = require("express").Router();
const { isLoggedIn, isAdminOrVendedor } = require("../../../lib/auth");
const { getClientesFull } = require("../../../model/CRM/get_tablas/get_clientes");
const { getPlanilla } = require("../../../lib/mercaderia/planillasDeCarga"); 
const { cargarStockPlanilla, insertSobreCarga } = require("../../../model/mercaderia/planilla");
const { getUnidades } = require("../../../model/auth/getUsers");
const { getCargaVigente } = require("../../../model/mercaderia/camionetas/camionetas.model");

Router.get("/entrega_retiro/0", isLoggedIn, (req, res) => {
    res.redirect("/CRM");
});

Router.get("/entrega_retiro/:CTE", isLoggedIn, async (req, res) => {
    const { CTE } = req.params;
    const cte_data = await getClientesFull(CTE);
    res.render("mercaderia/entregas-retiros.ejs", { CTE, cte_data });

});

Router.post("/entrega_retiro", isLoggedIn, async (req, res) => {
    const { CTE, ENTREGA_RETIRO, FICHA, ART } = req.body;
    const { Usuario, UNIDAD } = req.user;
    const FECHA = new Date().toISOString().split("T")[0];

    const response = await getPlanilla(Usuario, FECHA);
    const sobrecarga = JSON.parse(response.SOBRECARGA);

    //GENERA EL REGISTRO EN PLANILLA DE STOCK
    const arts = ART.trim().split(" "), articulos = [];
    const efecto = 0;
    //Define el efecto
    const efecto_unidad = ENTREGA_RETIRO.toUpperCase().includes("ENTREGADO") ? -1 : 1;
    for (let i = 0; i < arts.length; i++) {
        //Inserta en la MATRIZ de stock
        articulos.push([
            UNIDAD, CTE, FICHA,
            arts[i], Usuario, Usuario,
            ENTREGA_RETIRO, ENTREGA_RETIRO, ENTREGA_RETIRO, ENTREGA_RETIRO,
            FECHA, efecto, "SOBRECARGA", efecto_unidad
        ]);

        //CARGA A LA PLANILLA DE SOBRECARGA (YA CONFIRMADO)
        CARGA = efecto_unidad == 1 ? "Cargado" : "Descargado";
        const nueva_sobrecarga = { CTE, FICHA, ART: arts[i], CARGA, TIPO: ENTREGA_RETIRO, OBS: "", CONTROL: Usuario };
        sobrecarga.push(nueva_sobrecarga);

    }

    await cargarStockPlanilla(articulos);
    await insertSobreCarga(JSON.stringify(sobrecarga), FECHA, Usuario);
    //REDIRECCION A PLANILLA DE HOY
    res.redirect("/mis_planillas/" + FECHA + "/" + Usuario);


});


Router.get("/cargas_camionetas", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    //Si es vendedor directo a su camioneta
    const { UNIDAD, RANGO } = req.user;
    if (RANGO == "VENDEDOR")
        return res.redirect(`/cargas_camionetas/${UNIDAD}`)

    //Si no, lista de camionetas
    const unidades = await getUnidades();
    const data = { title: "Lista de camionetas", items: [], links: [] };
    data.items = unidades.map(e => e.UNIDAD);
    data.links = unidades.map(e => "/cargas_camionetas/" + e.UNIDAD);

    res.render("list-items.ejs", { data });

});


Router.get("/cargas_camionetas/:UNIDAD", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const { UNIDAD } = req.params;
    const stock = await getCargaVigente(UNIDAD)
    res.render("mercaderia/camionetas/control_de_camionetas.ejs", { UNIDAD, stock });
});






module.exports = Router
