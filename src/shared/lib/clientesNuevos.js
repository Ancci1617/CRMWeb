const { INICIALES, LIMITANTES } = require("../constants/limitantes")


const getCreditoDisponibleEasyClienteNuevo = (limitante, tomadoFichasEasy, tomadoPrestamosEasy) => {
    const { EASY } = INICIALES
    const disponible = limitante ? LIMITANTES[limitante] * 10000 : Math.max(EASY * 10000 - tomadoFichasEasy - tomadoPrestamosEasy, 0)

    return disponible
    

}

const getCreditoDisponibleBgmClienteNuevo = (limitante, tomadoFichasBGM, tomadoPrestamosBGM) => {
    const { BGM } = INICIALES
    

    const disponible = limitante ? LIMITANTES[limitante] : Math.max(BGM - tomadoFichasBGM - tomadoPrestamosBGM, 0)
    
    return disponible
}



const calcularClienteSinHistorial = (CTE, tomadoFichasBGM, tomadoPrestamosEasy) => {


    return {
        CTE,
        ZInicial: 0,
        ZFinal: 0,
        ComprasViejas: 0,
        ComprasNuevas: 0,
        promedioDiasDeAtraso: 0,
        MAXIMO_TOMADO: 0,
        PROMEDIO_TOMADO: 0,
        MINIMO_TOMADO: 0,
        limitante: null,
        limite: null,
        disponibleFinalEasy: Math.max(EASY - tomadoPrestamosEasy, 0) * 10000,
        disponibleFinalBgm: Math.max(BGM - tomadoFichasBGM, 0),
        calificacion: "Nuevo",
    }

}

module.exports = { getCreditoDisponibleEasyClienteNuevo, getCreditoDisponibleBgmClienteNuevo }