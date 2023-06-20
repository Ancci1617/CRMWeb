"use strict";
const Router = require("express").Router();
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes");
const { getMasterResumen } = require("../../model/CRM/get_tablas/get_master.js");
const { isLoggedIn, isNotLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers");
const { insertPedido, getPedidosByFiltros, updateOrdersAndEstadoById, updatePedidosCerrar, getPedidoByID, getPedidosByUsuario, updatePedidosReprogramar,
    getPedidosActivos, getPedidosTerminados,updatePedidoByID, getPedidosAcumulados, getPedidosProximos } = require("../../model/pedidos/pedidos.model");
const {today} = require("../../lib/dates");



//MIS_PEDIDOS
Router.get("/pedidos/", isAdminOrVendedor, (req, res) => {
    // const data = { title: "Pedidos", items: ["Mis pedidos", "Proximos", "Acumulados"], links: ["/pedidos/mis_pedidos", "/pedidos/proximos_pedidos", "/pedidos/mis_pedidos/acumulados"] };
    const data = { title: "Pedidos", items: ["Mis pedidos"], links: ["/pedidos/mis_pedidos"] };
    res.render("list-items.ejs", { data });
});

Router.get("/pedidos/mis_pedidos", isAdminOrVendedor, async (req, res) => {
    //get mis pedidos
    const { Usuario } = req.user;
    const today = new Date().toISOString().split("T")[0];
    const pedidos = await getPedidosByFiltros(Usuario, "%");

    const pedidos_de_hoy = pedidos.filter(pedido => pedido.DIA_VISITA <= today);
    const activos = pedidos_de_hoy.filter(pedido => pedido.ESTADO == "ACTIVO");
    const pendientes = pedidos_de_hoy.filter(pedido => pedido.ESTADO == "PENDIENTE");

    res.render("pedidos/pedidos.mis_pedidos.ejs", { activos, pendientes });
});




Router.post("/pedidos/recorrido/cargar_orden", isAdminOrVendedor, async (req, res) => {
    const { ORDEN = [], ID = [], ESTADO = [] } = req.body;
    console.log("body", req.body);
    //Si no es array, que sea array
    const ORDEN_ARR = Array.isArray(ORDEN) ? ORDEN : [ORDEN];
    const ID_ARR = Array.isArray(ID) ? ID : [ID];
    const ESTADO_ARR = Array.isArray(ESTADO) ? ESTADO : [ESTADO];


    //Si existe el orden,id e Estado
    if (ORDEN_ARR.length > 0 && ID_ARR.length > 0 && ESTADO_ARR.length > 0) {
        //recibe [[primerID,primerOrden] , [primerID,primerOrden]]
        const ID_ORDER = [];
        for (let i = 0; i < ORDEN_ARR.length; i++) {
            ID_ORDER.push([ID_ARR[i], ORDEN_ARR[i], ESTADO_ARR[i]]);
        }

        await updateOrdersAndEstadoById(ID_ORDER);


    }
    res.sendStatus(200);

});




//DETALLE
Router.get("/pedidos/recorrido/detalle", isAdminOrVendedor, async (req, res) => {

    const { Usuario } = req.user;
    const pedidos = await getPedidosByFiltros(Usuario, "ACTIVO");

    const cte_data = { Disponibles: new Map() };

    //Carga todas las ofertas disponibles de los pedidos
    for (let i = 0; i < pedidos.length; i++) {
        const Disponible = await getMasterResumen(pedidos[i].CTE || 0);
        cte_data.Disponibles.set(pedidos[i], Disponible[0]);
    }

    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN"]);

    res.render("pedidos/pedido.recorrido.detalle.ejs", { cte_data, pedidos, usuarios });

});

Router.get("/pedidos/pedido_vendi/:ID", isAdminOrVendedor, async (req, res) => {
    const { ID } = req.params;
    const today = new Date().toISOString().split("T")[0];
    await updatePedidosCerrar("HECHO", "VENDIDO", today, ID);
    res.redirect(`/pedidos/recorrido/detalle`);
});

Router.post("/pedidos/cancelar", isAdminOrVendedor, async (req, res) => {
    const { ID, MOTIVO } = req.body;
    await updatePedidosCerrar("HECHO", MOTIVO, "CANCELADO", ID);
    res.redirect(`/pedidos/recorrido/detalle`);
});

Router.post("/pedidos/reprogramar", isAdminOrVendedor, async (req, res) => {
    const { ID, DESDE, HASTA, FECHA } = req.body;
    await updatePedidosReprogramar({ MOTIVO: "REPROGRAMADO", ESTADO: "PENDIENTE", ID, FECHA, DESDE, HASTA });
    res.redirect(`/pedidos/recorrido/detalle`);
});

Router.post("/pedidos/reasignar", isAdminOrVendedor, async (req, res) => {
    const { ID, MOTIVO, USUARIO } = req.body;
    const pedido = await getPedidoByID(ID);
    const { CTE, ZONA, NOMBRE, CALLE, DIA_VISITA, CRUCES, CRUCES2, TELEFONO, DESDE, HASTA, QUE_NECESITA, REDES } = pedido;

    await updatePedidoByID({
        CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2,
        TELEFONO, QUE_NECESITA, DIA_VISITA, DESDE,
        HASTA, DESIGNADO: USUARIO, REDES, MOTIVO
    }, ID);

    res.redirect(`/pedidos/recorrido/detalle`);
});

Router.get("/pedidos/mis_pedidos/proximos", isAdminOrVendedor, async (req, res) => {

    res.render("pedidos/pedidos.mis_pedidos.proximosejs");
});



//pedidos generales
Router.get("/pedidos/generales", isAdmin, async (req, res) => {
    const data = { title: "Pedidos", items: ["Activos", "Acumulados", "Proximos"], links: ["/pedidos/generales/activos", "/pedidos/generales/acumulados", "/pedidos/generales/proximos"] };
    res.render("list-items.ejs", { data });
});
Router.get("/pedidos/generales/activos", isAdmin, async (req, res) => {
    const pedidos = await getPedidosActivos(today);
    const vendedores = sortPedidosOjb(pedidos,"DESIGNADO");
    //vendedores = {DIEGO : [{ID : 1,CTE:8108,Nombre:"Graciela"},{...},GABRIEL : [{...}]  }
    res.render("pedidos/pedidos.generales.activos.ejs", {vendedores,title:"Activos"});

});
Router.get("/pedidos/generales/proximos", isAdmin, async (req, res) => {
    const pedidos = await getPedidosProximos(today);
    const vendedores = sortPedidosOjb(pedidos,"DESIGNADO");
    res.render("pedidos/pedidos.generales.activos.ejs", { vendedores,title:"Proximos" });

});

Router.get("/pedidos/generales/acumulados", isAdmin, async (req, res) => {
    const pedidos = await getPedidosTerminados();
    const vendedores = sortPedidosOjb(pedidos,"VISITADO");
        res.render("pedidos/pedidos.generales.acumulados.ejs", { vendedores,title:"Acumulados"  });
});



//Editar pedido
Router.get("/pedidos/editar_pedido/:ID", isAdmin, async (req, res) => {

    const pedido = await getPedidoByID(req.params.ID);
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN"]); //Cambiar este Magic String
    res.render("pedidos/pedido.editar.ejs", { pedido, usuarios });

});

Router.post("/pedidos/editar_pedido", isAdmin, async (req, res) => {
    const { CTE, NOMBRE, CALLE, ZONA, CRUCES, CRUCES2, TELEFONO,
        QUE_NECESITA, DIA_VISITA, RANGO_HORARIO_DESDE,
        RANGO_HORARIO_HASTA, VENDEDOR_DESIGNADO, ID } = req.body;

    const REDES = req.user.Usuario;
    await updatePedidoByID({
        CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO,
        QUE_NECESITA, DIA_VISITA, DESDE: RANGO_HORARIO_DESDE,
        HASTA: RANGO_HORARIO_HASTA, DESIGNADO: VENDEDOR_DESIGNADO, REDES
    }, ID);


    res.redirect("/pedidos/generales");
});







//CRM
Router.get("/pedidos/cargar_pedido/:CTE", isAdminOrVendedor, async (req, res) => {

    const { CTE } = req.params;
    const cte_data = await getClientes(CTE);
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN"], [""]);

    res.render("pedidos/pedidos.cargar.ejs", { cte_data: cte_data[0], usuarios });

});
Router.post("/pedidos/cargar_pedido", isAdminOrVendedor, async (req, res) => {

    const { CTE, NOMBRE, CALLE, ZONA, CRUCES, CRUCES2, TELEFONO, QUE_NECESITA,
        DIA_VISITA, RANGO_HORARIO_DESDE, RANGO_HORARIO_HASTA, VENDEDOR_DESIGNADO,
        EVALUACION, EVALUACION_DETALLE } = req.body;
    const { Usuario } = req.user;

    const DIA = new Date().toISOString().split("T")[0];
    const HORA = new Date(new Date() - 1000 * 60 * 60 * 3).toISOString().split("T")[1].substring(0, 5);

    insertPedido(DIA, HORA, CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2,
        TELEFONO, QUE_NECESITA, DIA_VISITA, RANGO_HORARIO_DESDE, RANGO_HORARIO_HASTA,
        VENDEDOR_DESIGNADO, "PENDIENTE", EVALUACION, EVALUACION_DETALLE, Usuario);

    res.redirect("/CRM");

});





function sortPedidosOjb(pedidos,SORT){
    const res_obj = {};
    const vendedores = [...new Set(pedidos.map(pedido => pedido[SORT]))];
    vendedores.forEach(vendedor => {
        res_obj[vendedor] = pedidos.filter(pedido => pedido[SORT] == vendedor);
    });
    return res_obj;
}


//PASAR PEDIDOS DE ACTIVOS A HECHO



module.exports = Router;