const { getFichasOptimized } = require("../../model/CRM/get_tablas/get_fichas.js");
const { getDebtEasy, getDoubt } = require("../../lib/doubt.js")



const getFichasVigentes = async (CTE, options = { withAcumulado: false, withCambiosDeFecha: false, withAtraso: false }) => {
    const fichasRaw = await getFichasOptimized(options, [`Fichas.CTE in (${Array.isArray(CTE) ? CTE.join(",") : CTE})`]);
    const fichasVigentes = fichasRaw.map(ficha => {
        return ficha.FICHA < 50000 ?
            { ...ficha, ...getDoubt(ficha) } :
            { ...ficha, CAPITAL : parseInt(ficha.CAPITAL),...getDebtEasy(ficha) }
    });
    return fichasVigentes
}
// const getFichasVigentesPorLote = async (cteList, options = { withAcumulado: false, withCambiosDeFecha: false, withAtraso: false }) => {
//     const fichasRaw = await getFichasOptimized(options, [`Fichas.CTE in (${cteList.join(",")})`]);
//     const fichasVigentes = fichasRaw.map(ficha => { return ficha.FICHA < 50000 ? { ...ficha, ...getDoubt(ficha) } : { ...ficha, ...getDebtEasy(ficha) } });
//     return fichasVigentes
// }
const splitPrestamosFichas = (fichasAEvaluar) => {
    const prestamos = fichasAEvaluar.filter(ficha => ficha.FICHA >= 50000)
    const fichas = fichasAEvaluar.filter(ficha => ficha.FICHA < 50000)
    return { prestamos, fichas }
}
module.exports = { getFichasVigentes, splitPrestamosFichas }




