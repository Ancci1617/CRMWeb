"use strict"
const Router = require("express").Router();
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes");
const { getMasterResumen } = require("../../model/CRM/get_tablas/get_master.js");

const { getNombresDeUsuariosByRango } = require("../../model/auth/getUsers");
const { insertPedido, getPedidosByDesignado, updateOrdersAndEstadoById, updatePedidosCerrar, getPedidoByID } = require("../../model/pedidos/pedidos.model");

Router.get("/pedidos/cargar_pedido/:CTE", async (req, res) => {
    const { CTE } = req.params;
    const cte_data = await getClientes(CTE);
    const usuarios = await getNombresDeUsuariosByRango("VENDEDOR"); //Cambiar este Magic String

    res.render("pedidos/pedidos.cargar.ejs", { cte_data: cte_data[0], usuarios });

});

Router.post("/pedidos/cargar_pedido", async (req, res) => {
    console.log("body", req.body);
    const { CTE, NOMBRE, CALLE, ZONA, CRUCES, CRUCES2, TELEFONO, QUE_NECESITA,
        DIA_VISITA, RANGO_HORARIO_DESDE, RANGO_HORARIO_HASTA, VENDEDOR_DESIGNADO,
        EVALUACION, EVALUACION_DETALLE } = req.body;
    const DIA = new Date().toISOString().split("T")[0];
    const HORA = new Date(new Date() - 1000 * 60 * 60 * 3).toISOString().split("T")[1].substring(0, 5);

    insertPedido(DIA, HORA, CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2,
        TELEFONO, QUE_NECESITA, DIA_VISITA, RANGO_HORARIO_DESDE, RANGO_HORARIO_HASTA,
        VENDEDOR_DESIGNADO, "PENDIENTE", EVALUACION, EVALUACION_DETALLE);

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
    const { ORDEN, ID, ESTADO } = req.body;

    //recibe [[primerID,primerOrden] , [primerID,primerOrden]]
    const ID_ORDER = [];
    for (let i = 0; i < ORDEN.length; i++) {
        ID_ORDER.push([ID[i], ORDEN[i], ESTADO[i]]);
    }
    await updateOrdersAndEstadoById(ID_ORDER);
    res.redirect("/pedidos/mis_pedidos");

});

Router.get("/pedidos/recorrido/detalle/:ID", async (req, res) => {

    const { ID } = req.params;
    const pedido = await getPedidoByID(ID);

    
    const cte_data = {};
    cte_data.Disponible = await getMasterResumen(pedido.CTE || 0);
    cte_data.Clientes = await getClientes(pedido.CTE || 0);


    res.render("pedidos/recorrido/mis_pedidos", { cte_data, pedido });

});



//PASAR PEDIDOS DE ACTIVOS A COMPLETOS
Router.get("/pedidos/pedido_vendi/:ID", async (req, res) => {
    const { ID } = req.params;
    await updatePedidosCerrar("VENDIDO", ID);
    res.redirect(`/pedidos/recorrido/detalle/:${ID}`);
});


module.exports = Router;