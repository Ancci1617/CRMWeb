const { getBaseDetalle, getPagosAcumulados } = require("../model/cteData")



const getEvaluationData = async (CTE, formatterBaseDetalle, formatterPagos,Easy = false) => {
    const BaseDetalleRaw = await getBaseDetalle({ CTE ,Easy})
    console.log("Base detalle consultada");
    const PagosRaw = await getPagosAcumulados({CTE,Easy})
    console.log("Pagos consultados");
    const pagos = formatterPagos(PagosRaw)
    console.log("pagos Formateados");
    const BaseDetalle = formatterBaseDetalle(BaseDetalleRaw,pagos,Easy)

    console.log("BaseDetalleFormateada");
    return {BaseDetalle,pagos}
}



module.exports = {getEvaluationData}







