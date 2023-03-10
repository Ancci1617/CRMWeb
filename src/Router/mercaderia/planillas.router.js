const Router = require("express").Router();
const { isLoggedIn } = require("../../lib/auth");
const { getDatosParaPlanilla, insertPlanillaControl, insertPlanillaVendedor, existePlanilla, crearPlanilla, getPlanilla } = require("../../model/mercaderia/planilla")


Router.get("/mis_planillas", isLoggedIn, (req, res) => {
    res.render("mercaderia/mis-planillas.ejs", { user: req.user });
})



Router.get("/mis_planillas/planilla_de_carga", isLoggedIn, async (req, res) => {
    
    
    //Si la planilla no existe la crea
    if (!await existePlanilla(req.query.VENDEDOR, req.query.FECHA)) {

        let planilla_object = { RESUMEN: {}, ARTICULOS: [] };
        planilla_object.RESUMEN.VENDEDOR = req.query.VENDEDOR;
        planilla_object.RESUMEN.FECHA = req.query.FECHA;
        planilla_object.RESUMEN.UNIDAD = "AB717";


        //Con las ventas de ayer, genera los articulos
        const datos_para_planilla = await getDatosParaPlanilla(req.query.VENDEDOR, req.query.FECHA);
        for (let i = 0; i < datos_para_planilla.length; i++) {

            //GENERA UN ARRAY CON LOS ARTICULOS DE LAS VENTAS DEL DIA ANTERIOR
            let arts = datos_para_planilla[i].ARTICULOS.split(" ");

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



        //Por cada articulo del objeto planilla, genera un objeto VACIO
        //que es el ESTADO del movimiento del articulo del vendedor
        let control_vendedor_articulos = {ARTICULOS : []};
        planilla_object.ARTICULOS.forEach(e => {
            control_vendedor_articulos.ARTICULOS.push({
                FICHA : e.FICHA,
                ART : e.ART,
                ESTADO : ""
            })
        })


        //Genera la planilla de carga
        await crearPlanilla(req.query.VENDEDOR, req.query.FECHA, 
                            JSON.stringify(planilla_object), req.user.Usuario,
                            JSON.stringify(control_vendedor_articulos),
                            JSON.stringify(control_vendedor_articulos)
                            );

    }
    
    
    
    let response = await getPlanilla(req.query.VENDEDOR, req.query.FECHA);

    //Datos necesarios para la imgen de la planilla,1-Datos de las ventas,2-Estado del control,3-estado del vendedro
    const planilla = JSON.parse(response.PLANILLA);
    const ARTICULOS_CONTROL = JSON.parse(response.ARTICULOS_CONTROL);
    const ARTICULOS_VENDEDOR = JSON.parse(response.ARTICULOS_VENDEDOR);

    //REQ.user = CONTROL puede editar del lado del control, caso contrario, el ingreso solo es VISUAL
    //req.user = Vendedor, puede editar el lado del vendedor  caso contrario, el ingreso solo es VISUAL


    //Renderiza
    res.render("mercaderia/planilla.ejs", { user: req.user, planilla,ARTICULOS_CONTROL, ARTICULOS_VENDEDOR });
    
});

Router.post("/insertar_planilla", isLoggedIn, (req, res) => {
    console.log(req.body);

    res.send("ok")
    // insertPlanillaConrol();
});


module.exports = Router
