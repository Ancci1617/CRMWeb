const { getClientesAndLocation } = require("../../model/CRM/get_tablas/get_clientes.js");
const adminModel = require("../model/admin.model.js");
const { getFichasByCte } = require("../../pagos/model/pagos.model.js");

const editarClienteForm = async (req, res) => {
    const { cte } = req.params;

    try {
        // CTE,ZONA,NOMBRE,CALLE,CRUCES,CRUCES2,WHATSAPP,DNI,MASTER,LATITUD,LONGITUD
        const [cte_data] = await getClientesAndLocation(cte);
        if (!cte_data) return res.status(400).send("No se encontro el cliente.");

        res.render("admin/clientessv.editar.ejs", { cte_data })
    } catch (error) {
        console.log(error);
        return res.send("error al consultar datos del cliente")
    }


}


const editarClientePost = async (req, res) => {
    const { cte } = req.params;

    try {
        const sqlResponse = await adminModel.updateClientesSV(cte, { ...req.body, Usuario: req.user.Usuario });
        res.status(200).redirect(`/CRM?CTE=${cte}`);

    } catch (error) {
        console.log(error);
        res.status(400).send("No se pudieron editar los datos del cliente");
    }


}
const cargarRetirada = async (req,res) => {
    const { FICHA } = req.params;

    try {

        const sqlResponse = await adminModel.updateEstado(FICHA,req.user.Usuario,"RETIRADO");

    
        res.status(200).redirect(`/CRM?CTE=F:${FICHA}`);

    } catch (error) {   
        console.log(error);
        res.status(404).send("No se pudo cargar la retirada")
    }

}
const cargarDevolucion = async (req, res) => {
    const { FICHA } = req.params;
    try {

        const sqlResponse = await adminModel.updateEstado(FICHA,req.user.Usuario,"DEVOLUCION");

    
        res.status(200).redirect(`/CRM?CTE=F:${FICHA}`);

    } catch (error) {

        res.status(404).send("No se pudo cargar la devolucion")
    }

}
const editarFichaForm = async (req, res) => {
    const { FICHA } = req.params;

    try {
        // CTE,ZONA,NOMBRE,CALLE,CRUCES,CRUCES2,WHATSAPP,DNI,MASTER,LATITUD,LONGITUD
        const [ficha_data] = await getFichasByCte(FICHA, "FICHA");
        if (!ficha_data) return res.status(400).send("No se encontro la ficha.");

        res.render("admin/fichas.editar.ejs", { ficha_data })
    } catch (error) {
        console.log(error);
        return res.send("error al consultar datos de la ficha")
    }

}

const editarFichaPost = async (req, res) => {
    const { FICHA } = req.params;

    try {
        const sqlResponse = await adminModel.updateFichasSV(FICHA, req.body,req.user.Usuario);

        res.status(200).redirect(`/CRM?CTE=F:${FICHA}`);

    } catch (error) {
        console.log(error);
        res.status(400).send("No se pudieron editar los datos de la ficha");
    }
}

const cargarClavo = async (req,res) => {
    const {CTE} = req.params
    const {OBS} = req.body

    try {
        await adminModel.cargarClavoDb({CTE ,OBS})
        res.status(200).redirect(`/CRM?CTE=${CTE}`)
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : "No se pudo cargar el clavo"})
    }

}

module.exports = { editarClienteForm, editarClientePost, editarFichaForm, cargarDevolucion, editarFichaPost,cargarRetirada ,cargarClavo}






