const { getBaseDetalle, getPagosAcumulados } = require("../../model/cteData.js")
const { formatBaseDetalle } = require("../formatters/BaseDetalleBGMFormatter.js")
const { formatPagosAcumulados } = require("../formatters/PagosBGMFormater.js")



const getEvaluationData = async (CTE) => {
    const BaseDetalleRaw = await getBaseDetalle({ CTE,filterDevEasyCash : true })

    // console.log("Base detalle consultada");
    const PagosRaw = await getPagosAcumulados({CTE})
    console.time("pagos format")
    // console.log("Pagos consultados");
    const pagos = formatPagosAcumulados(PagosRaw)
    console.timeEnd("pagos format")
     

    console.time("Detalle format")
    // console.log("pagos Formateados");
    const BaseDetalle = formatBaseDetalle(BaseDetalleRaw,pagos)
    console.timeEnd("Detalle format")

    // console.log("BaseDetalleFormateada");
    return {BaseDetalle,pagos}
}



module.exports = {getEvaluationData}







