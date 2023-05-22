"use strict";
const Router = require("express").Router();
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes");
const { getMasterResumen } = require("../../model/CRM/get_tablas/get_master.js");

const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers");
const { insertPedido, getPedidosByDesignado, updateOrdersAndEstadoById, updatePedidosCerrar, getPedidoByID, getPedidosByUsuario, updatePedidosReprogramar,
    getPedidosActivos, updatePedidoByID } = require("../../model/pedidos/pedidos.model");

Router.get("/pedidos/cargar_pedido/:CTE", async (req, res) => {
    const { CTE } = req.params;
    const cte_data = await getClientes(CTE);
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR"], [""]); //Cambiar este Magic String

    res.render("pedidos/pedidos.cargar.ejs", { cte_data: cte_data[0], usuarios });

});

Router.get("/pedidos/", (req, res) => {
    const data = { title: "Pedidos", items: ["Mis pedidos", "Proximos"], links: ["/pedidos/mis_pedidos", "/pedidos/proximos_pedidos"] };
    res.render("list-items.ejs", { data });
});


Router.get("/pedidos/generales", async (req, res) => {
    const pedidos = await getPedidosActivos();
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN"], ["RODRIGO", "PAULA", "NAHUEL", "LAUTARO1", "JULIAN", "TIAGO"]);
    res.render("pedidos/pedidos.generales.activos.ejs", { pedidos, usuarios });
});

Router.get("/pedidos/editar_pedido/:ID", async (req, res) => {

    const pedido = await getPedidoByID(req.params.ID);
    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR"], [""]); //Cambiar este Magic String
    res.render("pedidos/pedido.editar.ejs", { pedido, usuarios });

});

Router.post("/pedidos/editar_pedido", async (req, res) => {
    const { CTE, NOMBRE, CALLE, ZONA, CRUCES, CRUCES2, TELEFONO,
        QUE_NECESITA, DIA_VISITA, RANGO_HORARIO_DESDE,
        RANGO_HORARIO_HASTA, VENDEDOR_DESIGNADO, ID } = req.body;

    const REDES = req.user.Usuario;
    await updatePedidoByID({
        CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO,
        QUE_NECESITA, DIA_VISITA, DESDE: RANGO_HORARIO_DESDE,
        HASTA: RANGO_HORARIO_HASTA, DESIGNADO: VENDEDOR_DESIGNADO, REDES
    },ID);


    res.redirect("/pedidos/generales");
});



Router.post("/pedidos/cargar_pedido", async (req, res) => {

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

Router.get("/pedidos/mis_pedidos", async (req, res) => {
    //get mis pedidos
    const { Usuario } = req.user;
    const pedidos = await getPedidosByDesignado(Usuario);

    const activos = pedidos.filter(pedido => pedido.ESTADO == "ACTIVO");
    const pendientes = pedidos.filter(pedido => pedido.ESTADO == "PENDIENTE");

    res.render("pedidos/pedidos.mis_pedidos.ejs", { activos, pendientes });
});

Router.post("/pedidos/recorrido/cargar_orden", async (req, res) => {
    const { ORDEN = [], ID = [], ESTADO = [] } = req.body;

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

    res.redirect("/pedidos/mis_pedidos");

});

Router.get("/pedidos/recorrido/detalle", async (req, res) => {

    const { Usuario } = req.user;
    const pedidos = await getPedidosByDesignado(Usuario, "ACTIVO");

    const cte_data = { Disponibles: new Map() };

    //Carga todas las ofertas disponibles de los pedidos
    for (let i = 0; i < pedidos.length; i++) {
        const Disponible = await getMasterResumen(pedidos[i].CTE || 0);
        cte_data.Disponibles.set(pedidos[i], Disponible[0]);
    }

    const usuarios = await getNombresDeUsuariosByRango(["VENDEDOR", "ADMIN"], ["RODRIGO", "PAULA", "NAHUEL", "LAUTARO1", "JULIAN", "TIAGO"]);

    res.render("pedidos/pedido.recorrido.detalle.ejs", { cte_data, pedidos, usuarios });

});








//PASAR PEDIDOS DE ACTIVOS A HECHO
Router.get("/pedidos/pedido_vendi/:ID", async (req, res) => {
    const { ID } = req.params;
    await updatePedidosCerrar("HECHO", "VENDIDO", ID);
    res.redirect(`/pedidos/recorrido/detalle/:${ID}`);
});


Router.post("/pedidos/cancelar", async (req, res) => {
    const { ID, MOTIVO } = req.body;
    await updatePedidosCerrar("CANCELADO", MOTIVO, ID);
    res.redirect(`/pedidos/recorrido/detalle/:${0}`);
});


Router.post("/pedidos/reprogramar", async (req, res) => {
    const { ID, DESDE, HASTA, FECHA } = req.body;
    await updatePedidosReprogramar({ MOTIVO: "REPROGRAMADO", ESTADO: "PENDIENTE", ID, FECHA, DESDE, HASTA });
    res.redirect(`/pedidos/recorrido/detalle/:${ID}`);
});

Router.post("/pedidos/reasignar", async (req, res) => {
    const { ID, DESDE, HASTA, FECHA } = req.body;
    await updatePedidosReprogramar({ MOTIVO: "REPROGRAMADO", ESTADO: "PENDIENTE", ID, FECHA, DESDE, HASTA });
    res.redirect(`/pedidos/recorrido/detalle/:${ID}`);
});



module.exports = Router;