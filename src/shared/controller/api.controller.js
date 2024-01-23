const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js");
const { getUbicacionByObject } = require("../../ubicaciones/model/ubicaciones.mode.js");
const { getRequiredImages } = require("../../ventas/controller/lib/required_images.js");
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





module.exports = { getCte, getUbicacion }




