const mercadoPagoModel = require("../model/mercadoPagoModel.js");
const { createArrayFromCsv } = require("./createArrayFromCsv");

const getSaldoEnCuenta = async ({ MP_TOKEN, begin_date,end_date}) => {

    const generated_reports = await mercadoPagoModel.getReportes({ MP_TOKEN });
    const report = generated_reports.find(rep =>
        rep.end_date.split("T")[0] == end_date.split("T")[0]
    )
    if (!report) {
        await mercadoPagoModel.generarReporte({ MP_TOKEN, begin_date, end_date });
        throw {msg : "Generando reporte, intentar mas tarde..."}
    }

    const reportData = await mercadoPagoModel.getReportData({ MP_TOKEN, file_name: report.file_name })
    const csv = createArrayFromCsv(reportData)
    const balance_amount = csv[csv.length - 2][5]


    return parseInt(balance_amount)


}



module.exports = { getSaldoEnCuenta }