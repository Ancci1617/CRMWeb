const Router = require("express").Router();
const { isLoggedIn, isAdmin } = require("../../lib/auth");
const { getDatosParaPlanilla, insertarBaseArticulos,
    existePlanilla, crearPlanilla, getPlanilla, getFechasPlanillasHabilitadas,
    insertarArticulos, cerrarPlanillaVendedor, cerrarPlanilla, habilitarVendedor, borrarPlanilla, crearPlanillaParcial } = require("../../model/mercaderia/planilla")
const { getFechaDeVentas,getVendedores } = require("../../model/ventas/ventas.query");


async function generarPlanillaDeCarga(VENDEDOR, FECHA, user) {

    //Con las ventas de ayer, genera los articulos
    let planilla_object = { RESUMEN: { VENDEDOR, FECHA }, ARTICULOS: [] };
    const datos_para_planilla = await getDatosParaPlanilla(VENDEDOR, FECHA);

    for (let i = 0; i < datos_para_planilla.length; i++) {

        //GENERA UN ARRAY CON LOS ARTICULOS DE LAS VENTAS DEL DIA ANTERIOR
        const arts = datos_para_planilla[i].ARTICULOS.trim().split(" ");

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
    await insertarBaseArticulos(FECHA, VENDEDOR,
        JSON.stringify(planilla_object),
        user.Usuario,
        JSON.stringify(control_vendedor_articulos),
        JSON.stringify(control_vendedor_articulos));

}

async function generarPlanillaDeCargaParcial(VENDEDOR, FECHA) {
    let planilla_object = { RESUMEN: { FECHA, VENDEDOR }, ARTICULOS: [] };
    planilla_object.RESUMEN.UNIDAD = "AB717";

    //Genera la planilla de carga
    await crearPlanilla(VENDEDOR, FECHA, JSON.stringify(planilla_object), null, null, null, "[]");

}


Router.get("/mis_planillas", isLoggedIn, async (req, res) => {

    let fechas;
    if (req.user.RANGO == "VENDEDOR") {
        fechas = await getFechasPlanillasHabilitadas(req.user.Usuario);
    } else if (req.user.RANGO == "ADMIN") {
        fechas = await getFechaDeVentas();
    } else {
        return res.redirect("/");
    }

    const today = new Date().toISOString().split("T")[0];
    if(fechas.filter(e => e.FECHA == today).length == 0){
        fechas.push({FECHA : today});
    }

    //Si es control
    res.render("mercaderia/mis-planillas.ejs", { user: req.user, fechas });

})


Router.get("/mis_planillas/:fecha", isLoggedIn, async (req, res) => {

    if (req.user.RANGO == "ADMIN") {
        const vendedores = await getVendedores(req.params.fecha);
        res.render("mercaderia/planilla-nombre-vendedores.ejs", {
            user: req.user,
            datos: {
                vendedores: vendedores,
                fecha: req.params.fecha
            }
        });

    } else if (req.user.RANGO == "VENDEDOR") {
        res.redirect("/mis_planillas/" + req.params.fecha + "/" + req.user.Usuario);

    } else {
        res.redirect("/");
    }


});



Router.get("/mis_planillas/:FECHA/:VENDEDOR", isLoggedIn, async (req, res) => {
    const { VENDEDOR, FECHA } = req.params;

    //Si la planilla no existe la crea
    if (!await existePlanilla(VENDEDOR, FECHA)) {
        //Genera Sobrecargas y la fila de la planilla
        if (req.user.RANGO !== "ADMIN") {
            return res.redirect("/mis_planillas");
        }
        await generarPlanillaDeCargaParcial(VENDEDOR, FECHA);
    }



    //Get de datos para renderizar planilla
    const response = await getPlanilla(VENDEDOR, FECHA);
    const planilla = JSON.parse(response.PLANILLA);
    const SOBRECARGA = JSON.parse(response.SOBRECARGA);
    const ARTICULOS_CONTROL = JSON.parse(response.ARTICULOS_CONTROL);
    const ARTICULOS_VENDEDOR = JSON.parse(response.ARTICULOS_VENDEDOR);

    console.log(datos);
    if (response.isEditableVendedor == 0 && response.isEditableControl == 0) {
        return res.render("mercaderia/planilla-visual.ejs", { user: req.user, planilla, ARTICULOS_CONTROL, ARTICULOS_VENDEDOR, SOBRECARGA, datos : response  });
    }

    if (response.VENDEDOR == req.user.Usuario) {
        if (response.isEditableVendedor == 0) {
            return res.render("mercaderia/planilla-visual.ejs", { user: req.user, planilla, ARTICULOS_CONTROL, ARTICULOS_VENDEDOR, SOBRECARGA, datos : response  });
        }
        return res.render("mercaderia/planilla-vendedor.ejs", { user: req.user, planilla, ARTICULOS_CONTROL, ARTICULOS_VENDEDOR, SOBRECARGA ,datos : response});
    }

    if (response.CONTROL == req.user.Usuario) {
        if (response.isEditableControl == 0) {
            return res.render("mercaderia/planilla-visual.ejs", { user: req.user, planilla, ARTICULOS_CONTROL, ARTICULOS_VENDEDOR, SOBRECARGA, datos : response  });
        }
        return res.render("mercaderia/planilla-control.ejs", { user: req.user, planilla, ARTICULOS_CONTROL, ARTICULOS_VENDEDOR, SOBRECARGA,datos : response });
    }



    return res.render("mercaderia/planilla-visual.ejs", { user: req.user, planilla, ARTICULOS_CONTROL, ARTICULOS_VENDEDOR, SOBRECARGA, datos : response  });

})

Router.get("/mis_planillas/:FECHA/:VENDEDOR/generar_planilla_de_carga", isLoggedIn, isAdmin, async (req, res) => {
    const { VENDEDOR, FECHA } = req.params;
    
    await generarPlanillaDeCarga(VENDEDOR,FECHA,req.user);
    res.redirect('/mis_planillas/' + FECHA + '/' + VENDEDOR);
})

Router.post("/insertar_estados", isLoggedIn, async (req, res) => {
    //Si vendedor en vendedor, si control control/ sino NO PERMITIDO
    const body = req.body;
    const vendedor = body.VENDEDOR;
    const fecha = body.FECHA;
    delete body.VENDEDOR;
    delete body.FECHA;


    //Datos de la planilla vigente
    const planilla = await getPlanilla(vendedor, fecha);

    //Copiar planilla.PLANILLA.ARTICULOS, pero con ESTADO = "El estaod de la matriz"
    const articulos = JSON.parse(planilla.ARTICULOS_CONTROL);

    for (let i = 0; i < articulos.ARTICULOS.length; i++) {
        articulos.ARTICULOS[i].ESTADO = body.ESTADO[i];
    }

    await insertarArticulos(fecha, vendedor, JSON.stringify(articulos), req.user.RANGO);

    res.redirect("/mis_planillas/" + fecha + "/" + vendedor);


});

Router.get("/mis_planillas/:fecha/:vendedor/cerrar_planilla", isLoggedIn, async (req, res) => {
    let usuario = req.user.Usuario;
    let FECHA = req.params.fecha;
    let VENDEDOR = req.params.vendedor;
    let response = await getPlanilla(VENDEDOR, FECHA);
    const planilla = JSON.parse(response.PLANILLA);
    const ARTICULOS_CONTROL = JSON.parse(response.ARTICULOS_CONTROL);
    const ARTICULOS_VENDEDOR = JSON.parse(response.ARTICULOS_VENDEDOR);


    if (usuario !== response.CONTROL && usuario !== response.VENDEDOR) {
        return res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);
    }
    if (usuario == response.VENDEDOR) {
        await cerrarPlanillaVendedor(FECHA, VENDEDOR);

    } else if (usuario == response.CONTROL) {
        if (JSON.stringify(ARTICULOS_CONTROL) == JSON.stringify(ARTICULOS_VENDEDOR) && response.isEditableVendedor == 0) {

            await cerrarPlanilla(FECHA, VENDEDOR);

        } else {

            //ACA IRIA EL ENVIO DEL FLASH MESSAGE
        }
    }
    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

});

Router.get("/mis_planillas/:fecha/:vendedor/habilitar_vendedor", isLoggedIn, isAdmin, async (req, res) => {
    let usuario = req.user.Usuario;
    let FECHA = req.params.fecha;
    let VENDEDOR = req.params.vendedor;

    await habilitarVendedor(FECHA, VENDEDOR);


    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

});

Router.get("/mis_planillas/:fecha/:vendedor/borrar_planilla", isLoggedIn, isAdmin, async (req, res) => {
    let usuario = req.user.Usuario;
    let FECHA = req.params.fecha;
    let VENDEDOR = req.params.vendedor;

    let planilla_object = { RESUMEN: { VENDEDOR, FECHA }, ARTICULOS: [] }
    
    await borrarPlanilla(FECHA, VENDEDOR,JSON.stringify(planilla_object));


    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

});


















module.exports = Router
