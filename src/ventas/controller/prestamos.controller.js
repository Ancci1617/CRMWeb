const { saveFileFromEntry } = require("../../lib/files");
const { getClientesAndLocation } = require("../../model/CRM/get_tablas/get_clientes");
const { getNuevoNumeroDeCte } = require("../../model/ventas/ventas.query");
const ventasModel = require("../model/ventas.model.js");
const { getRequiredImages } = require("./lib/required_images");


const postCargarPrestamo = async (req, res) => {
    const { Usuario } = req.user;

    const CTE = req.body.CTE == 0 ? await getNuevoNumeroDeCte() : req.body.CTE;
    const GARANTE_CTE = req.body.GARANTE_CTE || await getNuevoNumeroDeCte();

    const venta = await ventasModel.insertPrestamo(
        { body: Object.assign(req.body, { CTE, GARANTE_CTE }) },
        { Usuario, MODO: "EASY" });

    //Cargar fotos
    if (req.files) {
        const obj_garante = {};
        Object.keys(req.files).filter(key => key.includes("GARANTE")).forEach(key => { obj_garante[key.replaceAll("_GARANTE","")] = req.files[key] });
        const obj_cte = {};
        Object.keys(req.files).filter(key => key.includes("CTE")).forEach(key => { obj_cte[key.replaceAll("CTE_","")] = req.files[key] });

        //del titular  
        saveFileFromEntry(Object.entries(obj_cte), CTE);
        //del garante
        saveFileFromEntry(Object.entries(obj_garante), GARANTE_CTE);
    }

    console.log({CTE,GARANTE_CTE});
    res.send("OK")
}

const formCargarPrestamo = async (req, res) => {
    const { cte } = req.params;
    const [cte_data] = await getClientesAndLocation(cte);
    console.log(getRequiredImages(8108));
    res.render("ventas/prestamo.cargar.ejs", { cte_data, required_images: getRequiredImages(cte) });
}


module.exports = { postCargarPrestamo, formCargarPrestamo }