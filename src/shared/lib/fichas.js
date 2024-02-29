const { getFichasOptimized } = require("../../model/CRM/get_tablas/get_fichas.js");
const { getDebtEasy, getDoubt } = require("../../lib/doubt.js")



const getFichasVigentes = async (CTE, options = { withAcumulado: false, withCambiosDeFecha: false, withAtraso: false }, exceptoFichas) => {
    const criteriosWhere = []

    const cteString = Array.isArray(CTE) ? CTE.join(",") : CTE
    criteriosWhere.push(`Fichas.CTE in (${cteString})`)

    if (exceptoFichas) criteriosWhere.push(`Fichas.FICHA not in (${exceptoFichas.join(",")})`)

    const fichasRaw = await getFichasOptimized(options, criteriosWhere);
    

    //Hacer que retorne un objeto con propiedad termiandas y vigentes? para ahorras FichasAsBaseDetalle,quizas retorna el ratio de credito vencido

    const fichasVigentes = fichasRaw.map(ficha => {
        const abonado = ficha.TOTAL - ficha.CUOTA_ANT + ficha.CUOTA_PAGO;
        const VALOR_UNITARIO_TOMADO = abonado >= ficha.TOTAL * 0.5 ? ficha.VU : ficha.VALOR_UNITARIO_ORIGINAL;


        return ficha.FICHA <= 50000 ?
            { ...ficha, CAPITAL: 0, VALOR_UNITARIO: VALOR_UNITARIO_TOMADO, ...getDoubt(ficha) } :
            { ...ficha, CAPITAL: parseInt(ficha.CAPITAL), ...getDebtEasy(ficha) }
    });
    return fichasVigentes
}




module.exports = { getFichasVigentes }




