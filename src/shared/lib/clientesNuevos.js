const { round } = require("../../lib/numbers")
const {  LIMITANTES } = require("../constants/limitantes")
const { INICIALES } = require("../constants/nuevos")


const getCreditoDisponibleEasyClienteNuevo = (limitante, tomadoFichasEasy, tomadoPrestamosEasy) => {
    const { EASY } = INICIALES
    const disponible = limitante ? LIMITANTES[limitante] * 10000 : Math.max(EASY * 10000 - tomadoFichasEasy - tomadoPrestamosEasy, 0)

    return round(disponible,1)
    

}

const getCreditoDisponibleBgmClienteNuevo = (limitante, tomadoFichasBGM, tomadoPrestamosBGM) => {
    const { BGM } = INICIALES
    

    const disponible = limitante ? LIMITANTES[limitante] : Math.max(BGM - tomadoFichasBGM - tomadoPrestamosBGM, 0)
    
    return round(disponible,1)
}


module.exports = { getCreditoDisponibleEasyClienteNuevo, getCreditoDisponibleBgmClienteNuevo }