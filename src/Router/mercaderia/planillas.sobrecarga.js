const Router = require("express").Router();
const { isLoggedIn, isAdmin } = require("../../lib/auth");
const { getDatosParaPlanilla, insertPlanillaControl, insertSobreCarga,
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






Router.post("/sobrecarga", isLoggedIn, async (req, res) => {

    const { CTE, FICHA, ART, CARGA, TIPO, OBS, FECHA, VENDEDOR } = req.body;
    const response = await getPlanilla(VENDEDOR, FECHA);
    const nueva_sobrecarga = { CTE, FICHA, ART, CARGA, TIPO, OBS, CONTROL : "No confirmado" }
    const sobrecarga = JSON.parse(response.SOBRECARGA);
    sobrecarga.push(nueva_sobrecarga);

    await insertSobreCarga(JSON.stringify(sobrecarga), FECHA, VENDEDOR);

    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

});




module.exports = Router









