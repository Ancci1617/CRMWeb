
const { dateDiff, addMonth } = require("../../lib/dates.js");
const { getMasterSummaryBefore2023 } = require("../model/summary.js");

//Obtiene el Z inciial de la logica de las ventas < 2023
const getZInicial = (cteSummary) => {
    
        const { PROMEDIO, MINIMO, MAXIMO } = cteSummary;
        if (PROMEDIO < 7 && MINIMO < 7 && MAXIMO < 7.1) return 0.15
        if (PROMEDIO < 7.1 && MINIMO < 7.1 && MAXIMO < 8) return 0.4
        if (PROMEDIO < 9.1 && MINIMO < 8.1 && MAXIMO < 12) return 0.7
        return 1
    


}

//Recibe un array de objeto y retorna los valores unicos de compra en un array
const filtrarCodigosCte = (pagos) => {
    pagos.reduce((res, pago) => {
        const concatenado = pago.cte + "-" + pago.ficha;
        if (!res.includes(concatenado)) res.push(concatenado)
        return res
    }, []
    )
}


const calcularPagas = (pagado, valorCuota, redondeo) => {
    return Math.trunc(pagado / valorCuota + redondeo);
}



//codigo = concatenado de : N°CTE - N°FICHA
//A los pagos recibidos les agrega:
/*PAGADO_ANT,VencimientoValido,Pagas,VencimientoVigente,DIAS_ATRASO,Atraso_evaluado,VARIABLE_ATRASO*/
const formatPagosAcumulados = (pagos) => {
    const redondeo = 0.3;
    const codigos = filtrarCodigosCte(pagos);
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
            const cuotaAtrasada = diasDeAtraso > 7
            const variableAtraso = Number(cuotaAtrasada) / pago.CUOTAS
            pagosFormated.push({ ...pago, pagadoAnt, vencimientoValido, pagas, vencimientoVigente, diasDeAtraso, cuotaAtrasada, variableAtraso })


            return { pagasAnt: pagas, pagadoAnt: pagado }
        }, { pagadoAnt: 0, pagasAnt: 0 })

    });


    return pagosFormated
}


async function test(){
    
    console.log("Busca resumen de cliente");
    const [summary] = await getMasterSummaryBefore2023({cteList : [14626]});
    console.log(summary);
    console.log("Calcula el Z");
    const ZInicial = getZInicial(summary);
    console.log(ZInicial);
    
        
}
test()

module.exports = { getZInicial }









