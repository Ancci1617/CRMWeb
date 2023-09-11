const ventasModel = require("../model/ventas.model.js");
const { getAside } = require("./lib/aside.js");

const cargarVentas = async (req, res) => {
    const { FECHA_VENTA, USUARIO } = req.query;
    const ventas = await ventasModel.getVentas({ filter: { FECHA_VENTA, USUARIO } });
    console.log("🚀 ~ file: ventas.controller.js:7 ~ cargarVentas ~ ventas:", ventas)

    console.log("render_links");
    const aside = await getAside();

    // res.send("WORKS");
    res.render("ventas/cargar_ventas/ventas.cargar.ejs", { aside, ventas, USUARIO, FECHA: FECHA_VENTA })

}

const editarVenta = async (req, res) => {
    const { INDICE } = req.params;
    const [venta] = await ventasModel.getVentas({filter : {INDICE}});
    res.render("ventas/ventas.cargadas.editar.ejs", venta);
}








module.exports = { cargarVentas ,editarVenta}