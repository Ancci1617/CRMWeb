const { getFichasOptimized } = require("../../model/CRM/get_tablas/get_fichas");
const {getDebtEasy,getDoubt} = require("../../lib/doubt.js")



const getFichasVigentes = async (CTE, options = { withAcumulado : false, withCambiosDeFecha : false, withAtraso : false }) => {
    const fichasRaw = await getFichasOptimized(options, [`Fichas.CTE = ${CTE}`]);
    const fichasVigentes = fichasRaw.map(ficha => { return ficha.FICHA < 50000 ? { ...ficha, ...getDoubt(ficha) } : { ...ficha, ...getDebtEasy(ficha) } });
    return fichasVigentes
}


module.exports = { getFichasVigentes }




