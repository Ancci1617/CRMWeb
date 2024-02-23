const { getUbicacionByObject } = require("../../ubicaciones/model/ubicaciones.mode.js");
const { getRequiredImages } = require("../../ventas/controller/lib/required_images.js");
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js");
const {getListadoDeClientes} = require("../MysqlTable/model/clientes.js");
const {  getMaster, getMasterPorLote } = require("../calificaciones/calcularCalificaciones.js");


const getCte = async (req, res) => {
    const [cte_data] = await getClientes(req.query.CTE);

    if (!cte_data.CTE)
        return res.status(404).json({ success: false, msg: "No se encontro el cliente", found_length: 0, status: 404 })

    const required_images = getRequiredImages(req.query.CTE);


    res.status(200).json({ success: true, msg: "Cliente encontrado.", found_length: 1, cte_data, required_images })
}



const getUbicacion = async (req, res) => {
    const { CALLE } = req.body;
    try {
        const ubicacion = await getUbicacionByObject({ CALLE });
        res.status(200).json({ ubicacion });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: "Error al consultas la ubicacion de la calle" })
    }

}

const getCalificaciones = async (req,res) => {
    
    try {
        console.log(1);
        // const listaDeClientes = (await getListadoDeClientes()).slice(0,5000)
        const listaDeClientes = await getListadoDeClientes()
        console.log("clientes por evaluar calificaciones",listaDeClientes.length);
        console.log(2);
        // const listado = listaDeClientes.slice(0,5000)
        console.log(3);
        


        const calificaciones = await getMasterPorLote(listaDeClientes)
        
        res.status(200).json(calificaciones)

    } catch (error) {
        console.log(error);
        res.status(500).json({error : true,msg : "No se pudo obtener el resultado"})
    }



}




const getCalificacion = async (req,res) => {
    const {CTE} = req.params
    try {
        const disponible = await getMaster(CTE);

        res.status(200).json({
            BGM  :  disponible.disponibleFinalBgm,
            CAPITAL : disponible.disponibleFinalEasy,
            CALIF : disponible.calificacionBgm
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({error : true,msg : "Error al consultas las calificaciones"})
    }
}
module.exports = { getCte, getUbicacion, getCalificaciones ,getCalificacion}




