
//Recibe un array de objeto y retorna los valores unicos de compra en un array

const { addMonth, dateDiff } = require("../../../lib/dates.js");
const { calcularPagas } = require("../calculosAuxiliares");
const { filtrarCodigosCte } = require("./helper/filtrarCodigosCte");

//Cambiar que me de los codigos unicos de CODIGO-CTE


const formatPagosAcumulados = (pagos) => {
    console.log(pagos);
    const redondeo = 0.3;
    const codigos = filtrarCodigosCte(pagos);
    console.log("Codigos",codigos);
    const pagosFormated = [];   

    codigos.forEach(codigo => {
        const pagosFiltrados = pagos.filter(pago => pago.CTE + "-" + pago.FICHA == codigo);

        //1
        pagosFiltrados.reduce((acum, pago) => {
            const { pagadoAnt, pagasAnt } = acum;

            //Esta evaluacion se ejecuta en caso que pagasAnt <> pagas
            const pagado = pagadoAnt + pago.VALOR;
            const pagas = calcularPagas(pagado, pago.CUOTA, redondeo);

            if (pagas == pagasAnt) return { pagasAnt, pagadoAnt: pagado };

            const vencimientoValido = pagasAnt ? pago.VENCIMIENTO : pago.PRIMER_VENCIMIENTO
            const vencimientoVigente = addMonth(vencimientoValido, pagasAnt)
            const diasDeAtraso = Math.max(dateDiff(pago.FECHA, vencimientoVigente), 0)
            const cuotaAtrasada = diasDeAtraso >= 7
            const variableAtraso = Number(cuotaAtrasada) / pago.ORIGINALES
            pagosFormated.push({ ...pago, pagadoAnt, vencimientoValido, pagas, vencimientoVigente, diasDeAtraso, cuotaAtrasada, variableAtraso })


            return { pagasAnt: pagas, pagadoAnt: pagado }
        }, { pagadoAnt: 0, pagasAnt: 0 })

    });

    return pagosFormated
}
module.exports = {formatPagosAcumulados}