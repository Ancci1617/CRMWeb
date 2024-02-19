const { getUbicacionByObject } = require("../../ubicaciones/model/ubicaciones.mode.js");
const { getRequiredImages } = require("../../ventas/controller/lib/required_images.js");
const { getCreditoDisponibleBgm } = require("../lib/calificaciones.js");
const { getCliente } = require("../model/cteData.js")
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes.js")
const fs = require("fs");
const { getEvaluationData } = require("../lib/getEvaluationData.js");
const { formatPagosAcumulados } = require("../lib/formaters/PagosBGMFormater.js");
const { formatBaseDetalle } = require("../lib/formaters/BaseDetalleBGMFormatter.js");
const { getFichasVigentes } = require("../lib/fichas.js");
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

const getCalificaciones = async (req, res) => {
    try {

        const cteRaw = JSON.parse(fs.readFileSync("C:/A - Blanco GusMar/1 - Actual GusMar/Master acceso directo/ListaDeClientes.json")).CLIENTES;
        // console.log("Consultando calificaciones...");
        // const cteRaw = [ 25333, 25353]
        const cte  = cteRaw.slice(5000,10000)
        // console.log(cteRaw.length);
        // const cte = cteRaw
        // const calificaciones = await Promise.all(cte.map(async cte => {
        // }))
        // console.log("Consulta Base detalle y pagos");
        const { BaseDetalle, pagos } = await getEvaluationData(cte, formatBaseDetalle, formatPagosAcumulados)
        // console.log("Consulta datos demograficos del cliente");
        const cteDataArr = await getCliente({ CTE: cte })
        // console.log("Consulta fichas vigentes");
        const fichasVigentes = await getFichasVigentes(cte);

        // console.log({ BaseDetalle: BaseDetalle.length })
        // console.log({ pagos: pagos.length })

        // console.log("por calcular disponible");
        const disponibles = await Promise.all(cte.map(async CTE => {
            const cteDataCte = cteDataArr.filter(cteData => cteData.CTE == CTE)
            const fichasVigentesCte = fichasVigentes.filter(ficha => ficha.CTE == CTE)
            const BaseDetalleCte = BaseDetalle.filter(ficha => ficha.CTE == CTE)
            const PagosCte = pagos.filter(pago => pago.CTE == CTE)
            const disponible = await getCreditoDisponibleBgm(CTE, BaseDetalleCte, PagosCte, cteDataCte, fichasVigentesCte)
            return disponible
        }))
        // console.log("Disponibles listos, enviando al cliente", disponibles.length);
        // const fichas = await getFichasVigentesPorLote([cte[0],cte[1]])
        // const pagos = await getPagosAcumulados({CTE : cte})



        // console.log("POR ENVIAR AL CLIENTE", calificaciones);
        // res.status(200).json(calificaciones)
        res.status(200).json(disponibles)
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo consultar las calificaciones de los clientes" })
    }

}


module.exports = { getCte, getUbicacion, getCalificaciones }




