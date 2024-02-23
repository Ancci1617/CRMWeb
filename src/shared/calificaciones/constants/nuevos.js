

const INICIALES = {
    BGM: 1,
    EASY: 10000,
    CALIFICACION: "Nuevo"
}


const cteNuevoDisponibles = {

    ZInicial: 0,
    ZFinal: 0,
    MAXIMO_TOMADO: 0,
    PROMEDIO_TOMADO: 0,
    MINIMO_TOMADO: 0,
    promedioDiasDeAtraso: 0,
    ratioCreditoVencido: 0,
    disponibleBgm: INICIALES.BGM,
    incrementoBgm: 0,
    limitanteBgm: null,
    limiteBgm: INICIALES.BGM,
    disponibleFinalBgm: INICIALES.BGM,
    calificacionBgm: INICIALES.CALIFICACION,
    disponibleEasy: INICIALES.EASY,
    incrementoEasy: 0,
    limitanteEasy: null,
    limiteEasy: INICIALES.EASY,
    disponibleFinalEasy: INICIALES.EASY

}

const cteNuevoBgm = {
    disponible: INICIALES.BGM,
    incremento: 0,
    limitante: null,
    limite: INICIALES.BGM,
    disponibleFinal: INICIALES.BGM,
    calificacion: INICIALES.CALIFICACION
}
const cteNuevoEasy = {
    disponible: INICIALES.EASY,
    incremento: 0,
    limitante: null,
    limite: INICIALES.EASY,
    disponibleFinal: INICIALES.EASY
}


module.exports = { cteNuevoDisponibles, INICIALES, cteNuevoBgm, cteNuevoEasy }