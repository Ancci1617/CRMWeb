const { getBaseDetalle, getPagosAcumulados } = require("../model/cteData")



const getEvaluationData = async (CTE, formatterBaseDetalle, formatterPagos,Easy = false) => {
    const BaseDetalleRaw = await getBaseDetalle({ CTE ,Easy})
    const PagosRaw = await getPagosAcumulados({CTE,Easy})
    const pagos = formatterPagos(PagosRaw)
    const BaseDetalle = formatterBaseDetalle(BaseDetalleRaw,pagos,Easy)

    return {BaseDetalle,pagos}
}


module.exports = {getEvaluationData}







