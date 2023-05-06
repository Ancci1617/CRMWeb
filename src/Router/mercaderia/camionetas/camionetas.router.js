const Router = require("express").Router();
const { isLoggedIn, isAdminOrVendedor } = require("../../../lib/auth");
const { getClientesFull } = require("../../../model/CRM/get_tablas/get_clientes");
const { getPlanilla } = require("../../../lib/mercaderia/planillasDeCarga");
const { cargarStockPlanilla, insertSobreCarga } = require("../../../model/mercaderia/planilla");
const { getUnidades } = require("../../../model/auth/getUsers");
const { getCargaVigente, getMovimientosUnidad, getMovimientosFiltro ,insertarControlDeUnidades ,
        getControlesHistorial, getFechasHistorialControles } = require("../../../model/mercaderia/camionetas/camionetas.model");

Router.get("/entrega_retiro/0", isLoggedIn,isAdminOrVendedor, (req, res) => {
    res.redirect("/CRM");
});

Router.get("/entrega_retiro/:CTE", isLoggedIn,isAdminOrVendedor, async (req, res) => {
    const { CTE } = req.params;
    const cte_data = await getClientesFull(CTE);
    res.render("mercaderia/entregas-retiros.ejs", { CTE, cte_data });

});

Router.post("/entrega_retiro", isLoggedIn,isAdminOrVendedor, async (req, res) => {
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
            FECHA, efecto, "ENT/RET", efecto_unidad
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
    const movimientos = await getMovimientosUnidad(UNIDAD)
    const fechas = await getFechasHistorialControles(UNIDAD)
    res.render("mercaderia/camionetas/control_de_camionetas.ejs", { UNIDAD, stock, movimientos,fechas });
});

Router.post("/cargas_camionetas/filtro", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const { UNIDAD, FILTRO } = req.body;

    const movimientos = await getMovimientosFiltro(UNIDAD, FILTRO);
    res.json(movimientos);
});

Router.post("/cargas_camionetas/consulta_controles", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const { UNIDAD,FECHAHORA } = req.body;
    const controles = await getControlesHistorial(UNIDAD,FECHAHORA);
    res.json(controles);
});

Router.post("/cargas_camionetas/cargar_diferencias", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const { RESUMEN, CONTROL } = req.body;
    const { Usuario } = req.user;
    const FECHA = new Date(new Date() - 1000 * 60 * 60 * 3).toISOString().split("T")[0];
    const HORA = new Date(new Date() - 1000 * 60 * 60 * 3).toISOString().split("T")[1].substring(0,5);

    const submit_array = CONTROL.map(articulo =>
        [RESUMEN.UNIDAD, Usuario, articulo.ART ,articulo.VIGENTE,
        articulo.CONTROL, articulo.DIFERENCIA, FECHA,HORA]
    );
    
    await insertarControlDeUnidades(submit_array);

    res.json({ cargado: true, msg: "Cargado satisfactoriamente" });
})


module.exports = Router
