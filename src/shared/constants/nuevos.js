

const INICIALES = {
    BGM : 1,
    EASY : 1
}

const cteNuevoBgmObject = {
    ZInicial: 0,
    ZFinal: 0,
    ZFinalEasy: 0,
    ComprasViejas: 0,
    ComprasNuevas: 0,
    promedioDiasDeAtraso: 0,
    MAXIMO_TOMADO: 0,
    PROMEDIO_TOMADO: 0,
    MINIMO_TOMADO: 0,
    limitante: null,
    incremento: 0,
    incrementoEasy: 0,
    tomadoFichasBGM: null,
    tomadoPrestamosEasy: null,
    tomadoPrestamosBGM: null,
    calificacion: "Nuevo",
    limite: INICIALES.BGM,
    limiteEasy: INICIALES.EASY,
    disponible: INICIALES.BGM,
    disponibleEasyCash: INICIALES.EASY,
    disponibleFinalEasy: INICIALES.EASY,
    disponibleFinalBgm: INICIALES.BGM,
}


module.exports = { cteNuevoBgmObject ,INICIALES}