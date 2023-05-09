"use strict";

const Router = require("express").Router();
const { isLoggedIn, isAdmin, isAdminOrVendedor } = require("../../lib/auth");
const { getUserByUsuario } = require("../../model/auth/getUser");
const { getPlanilla } = require("../../lib/mercaderia/planillasDeCarga");
const { insertarBaseArticulos,
    existePlanilla, crearPlanilla,
    insertarArticulos, cerrarPlanillaVendedor, cerrarPlanilla, habilitarVendedor, borrarPlanilla,
    cargarStockPlanilla } = require("../../model/mercaderia/planilla")
const { getFechaDeVentas, getVendedores, getVentasVendedores } = require("../../model/ventas/ventas.query");


async function generarPlanillaDeCarga(VENDEDOR, FECHA, user) {

    //busca ventas del dia correspondiente, y genera el objeto planilla
    const planilla = { ARTICULOS: [] };
    const ventas = await getVentasVendedores(VENDEDOR, FECHA);

    //Por cada venta, array de articulos
    ventas.forEach(venta => {
        const { ARTICULOS, CTE, FICHA, ANTICIPO, ESTATUS } = venta;
        const arts = ARTICULOS.trim().split(" ");
        arts.forEach(ART => {
            planilla.ARTICULOS.push({ CTE, FICHA, ANTICIPO, ESTATUS, ART });
        });
    })

    //Por cada articulo del objeto planilla, genera un objeto con menos propiedades
    const articulos_carga = {};
    articulos_carga.ARTICULOS = planilla.ARTICULOS.map(articulo =>
    ({
        FICHA: articulo.FICHA,
        ART: articulo.ART,
        ESTADO: ""
    }));

    //Genera la planilla de carga
    await insertarBaseArticulos(FECHA, VENDEDOR,
        JSON.stringify(planilla),
        user.Usuario,
        JSON.stringify(articulos_carga),
        JSON.stringify(articulos_carga));

}




Router.get("/mis_planillas", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const fechas = await getFechaDeVentas();

    //Si no esta el dia de hoy en la matriz, lo agrega
    const today = new Date().toISOString().split("T")[0];
    if (!fechas.map(e => e.FECHA).includes(today)) fechas.unshift({ FECHA: today });
    //Renderiza
    res.render("mercaderia/mis-planillas.ejs", { fechas });

})


Router.get("/mis_planillas/:FECHA", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const { FECHA } = req.params;
    const { RANGO, Usuario } = req.user;

    //Si es vendedor, se mueve directo a su planilla
    if (RANGO == "VENDEDOR")
        return res.redirect("/mis_planillas/" + FECHA + "/" + Usuario);

    //Si no, muestra el nombre de los vendedores
    const vendedores = await getVendedores();
    return res.render("mercaderia/planilla-nombre-vendedores.ejs", {
        datos: { vendedores, FECHA }
    });

});



Router.get("/mis_planillas/:FECHA/:VENDEDOR", isLoggedIn, async (req, res) => {
    const { VENDEDOR, FECHA } = req.params;
    const { Usuario, RANGO } = req.user;

    //Get de datos para renderizar planilla
    const response = await getPlanilla(VENDEDOR, FECHA);
    const planilla = JSON.parse(response.PLANILLA);
    const SOBRECARGA = JSON.parse(response.SOBRECARGA);
    const ARTICULOS_CONTROL = JSON.parse(response.ARTICULOS_CONTROL);
    const ARTICULOS_VENDEDOR = JSON.parse(response.ARTICULOS_VENDEDOR);

    const render_object = { planilla, ARTICULOS_CONTROL, ARTICULOS_VENDEDOR, SOBRECARGA, datos: response };

    //Discrimina si es control,Vendedor + Renderiza
    if (response.VENDEDOR == Usuario && response.isEditableVendedor == 1)
        return res.render("mercaderia/planilla-vendedor.ejs", render_object);

    if (response.CONTROL == Usuario && response.isEditableControl == 1)
        return res.render("mercaderia/planilla-control.ejs", render_object);


    return res.render("mercaderia/planilla-visual.ejs", render_object);

})

Router.get("/mis_planillas/:FECHA/:VENDEDOR/generar_planilla_de_carga", isLoggedIn, isAdmin, async (req, res) => {
    const { VENDEDOR, FECHA } = req.params;
    await generarPlanillaDeCarga(VENDEDOR, FECHA, req.user);
    res.redirect('/mis_planillas/' + FECHA + '/' + VENDEDOR);
})

Router.post("/insertar_estados", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    //Si vendedor en vendedor, si control control/ sino NO PERMITIDO
    const { VENDEDOR, FECHA, ESTADO } = req.body;
    const { RANGO } = req.user;

    //Datos de la planilla vigente
    const planilla = await getPlanilla(VENDEDOR, FECHA);
    const articulos = JSON.parse(planilla.ARTICULOS_CONTROL);

    //Por cada articulo del body, lo inserta en la matriz de articulos de la planilla
    articulos.ARTICULOS[0].ESTADO = ESTADO;
    if (typeof ESTADO == "object") {
        for (let i = 0; i < articulos.ARTICULOS.length; i++) {
            articulos.ARTICULOS[i].ESTADO = ESTADO[i];
        }
    }


    await insertarArticulos(FECHA, VENDEDOR, JSON.stringify(articulos), RANGO);
    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);


});

Router.get("/mis_planillas/:FECHA/:VENDEDOR/cerrar_planilla", isLoggedIn, isAdminOrVendedor, async (req, res) => {
    const { Usuario } = req.user;
    const { FECHA, VENDEDOR } = req.params;

    const response = await getPlanilla(VENDEDOR, FECHA);
    const planilla = JSON.parse(response.PLANILLA);
    const ARTICULOS_CONTROL = JSON.parse(response.ARTICULOS_CONTROL);
    const ARTICULOS_VENDEDOR = JSON.parse(response.ARTICULOS_VENDEDOR);

    if (Usuario == response.VENDEDOR) {
        await cerrarPlanillaVendedor(FECHA, VENDEDOR);
    } else if (
        //Condiciones para cerrar planilla
        Usuario == response.CONTROL &&
        JSON.stringify(ARTICULOS_CONTROL) == JSON.stringify(ARTICULOS_VENDEDOR) &&
        response.isEditableVendedor == 0 &&
        response.isEditableControl == 1
    ) {
        //GENERA LA LISTA DE ARTICULOS PARA INSERTAR EN LA TABLA DE STOCK
        const articulos = [];
        const VENDEDOR_USER = await getUserByUsuario(VENDEDOR);
        for (let i = 0; i < planilla.ARTICULOS.length; i++) {

            const { CTE, FICHA, ART, ESTATUS } = planilla.ARTICULOS[i];
            const { ESTADO } = ARTICULOS_CONTROL.ARTICULOS[i];

            //Define el efecto
            let efecto = ESTADO == "Cargado" ? -1 : 0
            let efecto_unidad = ESTATUS.toUpperCase().includes("ENTREGADO") ? -1 : 0;
            efecto_unidad += efecto * -1;

            articulos.push([
                VENDEDOR_USER.UNIDAD,
                CTE, FICHA, ART, VENDEDOR, Usuario,
                ESTATUS, ESTADO, ESTADO, ESTADO,
                FECHA, efecto, "CARGA", efecto_unidad
            ]);
        }

        //INSERTA LOS ARTICULOS EN LA TABLA DE STOCK
        await cargarStockPlanilla(articulos);
        await cerrarPlanilla(FECHA, VENDEDOR);
    } else {
        //lAS PLANILLAS NO SON IGUALES o bien no tiene permisos de edicion
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

Router.get("/mis_planillas/:FECHA/:VENDEDOR/borrar_planilla", isLoggedIn, isAdmin, async (req, res) => {
    const { FECHA, VENDEDOR } = req.params;
    await borrarPlanilla(FECHA, VENDEDOR, JSON.stringify({ ARTICULOS: [] }));
    res.redirect("/mis_planillas/" + FECHA + "/" + VENDEDOR);

});


module.exports = Router


