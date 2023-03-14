const Router = require("express").Router();
const { isLoggedIn, isAdmin } = require("../../lib/auth");
const { getDatosParaPlanilla, insertPlanillaControl,
    existePlanilla, crearPlanilla, getPlanilla, getFechasPlanillasHabilitadas,
    insertarArticulos, cerrarPlanillaVendedor, cerrarPlanilla, habilitarVendedor, borrarPlanilla } = require("../../model/mercaderia/planilla")
const { getFechaDeVentas, getVendedoresConVentas } = require("../../model/ventas/ventas.query");
const { getNombresDeUsuarios } = require("../../model/auth/getUsers");

async function generarSobrecarga(VENDEDOR, FECHA, user) {

    let planilla_object = { RESUMEN: { VENDEDOR, FECHA }, ARTICULOS: [] };

    
    //Con las ventas de ayer, genera los articulos
    const datos_para_planilla = await getDatosParaPlanilla(VENDEDOR, FECHA);

    for (let i = 0; i < datos_para_planilla.length; i++) {

        //GENERA UN ARRAY CON LOS ARTICULOS DE LAS VENTAS DEL DIA ANTERIOR
        const arts = datos_para_planilla[i].ARTICULOS.split(" ");

        //POR CADA ARTICULOS INSERTA UN OBJETO EN EL ARRAY DE la planilla
        for (let j = 0; j < arts.length; j++) {
            planilla_object.ARTICULOS.push({
                CTE: datos_para_planilla[i].CTE,
                FICHA: datos_para_planilla[i].FICHA,
                ANT: datos_para_planilla[i].ANTICIPO,
                ESTATUS: datos_para_planilla[i].ESTATUS,
                ART: arts[j]
            });
        };
    }

    //Por cada articulo del objeto planilla, genera un objeto vacio
    //Que es el ESTADO del movimiento del articulo del vendedor
    let control_vendedor_articulos = { ARTICULOS: [] };

    planilla_object.ARTICULOS.forEach(e => {
        control_vendedor_articulos.ARTICULOS.push({
            FICHA: e.FICHA,
            ART: e.ART,
            ESTADO: ""
        })
    })

    //Genera la planilla de carga
    // await crearPlanilla(VENDEDOR, FECHA,
    //     JSON.stringify(planilla_object),
    //     user.Usuario,
    //     JSON.stringify(control_vendedor_articulos),
    //     JSON.stringify(control_vendedor_articulos));

    //await generarSqlSobrecarga();
}






Router.get("/mis_planillas/sobrecargas", isLoggedIn, async (req, res) => {

    let nombres = {};
    nombres.usuarios = await getNombresDeUsuarios();

    res.render("mercaderia/planilla-sobrecarga-nombres.ejs", { user: req.user, datos: nombres })

});

Router.get("/mis_planillas/sobrecargas/:vendedor", isLoggedIn, isAdmin, async (req, res) => {

    //Renderizar planilla de carga
    res.render("mercaderia/planilla-sobrecarga-carga.ejs", { user: req.user });

});

Router.post("/mis_planillas/generar_sobrecarga", isLoggedIn, isAdmin, async (req, res) => {

    //Renderizar planilla de carga




});




module.exports = Router









