const { dateDiff } = require("../../lib/dates.js");
const { getDoubt, getDebtEasy } = require("../../lib/doubt.js");
const pagosModel = require("../model/pagos.model.js");

const generarSaldoAnteriorEasyCash = async (pago) => {

    const fichas = await pagosModel.getFichasByCte(pago.CTE, "CTE");
    const ficha = fichas.find(ficha => ficha.FICHA == pago.FICHA);

    const deuda_real = getDebtEasy(ficha);

    console.log(Object.assign({ ...ficha }, { CUOTA_PAGO: ficha.CUOTA_PAGO - pago.VALOR, SERV_PAGO: ficha.SERV_PAGO - pago.SERV, MORA_PAGO: ficha.MORA_PAGO - pago.MORA, SALDO: ficha.SALDO + pago.VALOR }));

    const deuda_pendiente = getDebtEasy(Object.assign({ ...ficha }, { CUOTA_PAGO: ficha.CUOTA_PAGO - pago.VALOR, SERV_PAGO: ficha.SERV_PAGO - pago.SERV, MORA_PAGO: ficha.MORA_PAGO - pago.MORA, SALDO: parseInt(ficha.SALDO) + parseInt(pago.VALOR) }));

    if (deuda_real.atraso_evaluado == 0)
        return await pagosModel.updateMoraYServAnt({ MORA_ANT: ficha.MORA_PAGO, SERVICIO_ANT: ficha.SERV_PAGO, FICHA: pago.FICHA });


    if (Math.floor(deuda_real.atraso_evaluado) !== Math.floor(deuda_pendiente.atraso_evaluado)) {
        const mora_unit = Math.max(Math.round(ficha.ARTICULOS * 0.01 / 100) * 100, 150);


        const MORA_ANT = Math.min(dateDiff(deuda_real.vencimiento_vigente, deuda_pendiente.vencimiento_vigente) * mora_unit + Math.min(ficha.MORA_ANT, 0), ficha.MORA_PAGO);



        await pagosModel.updateMoraYServAnt({ MORA_ANT, SERVICIO_ANT: ficha.SERVICIO_ANT, FICHA: pago.FICHA });
    }



}

const generarSaldoAnteriorBgm = async (pago) => {
    const fichas = await pagosModel.getFichasByCte(pago.CTE, "CTE");
    const ficha = fichas.find(ficha => ficha.FICHA == pago.FICHA);

    const deuda = getDoubt(ficha);

    if (deuda.atraso_evaluado == 0)
        return await pagosModel.updateMoraYServAnt({ MORA_ANT: ficha.MORA_PAGO, SERVICIO_ANT: ficha.SERV_PAGO, FICHA: pago.FICHA });

}



module.exports = { generarSaldoAnteriorEasyCash, generarSaldoAnteriorBgm }










