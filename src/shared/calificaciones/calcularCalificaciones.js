const { calcularTomado, getZInicial, calcularZFinal } = require("./lib/auxiliares.js")
const { getFichasVigentes  } = require("../lib/fichas.js")
const {splitPrestamosFichas} = require("../../lib/fichas.js") 
const { fichasAsBaseDetalle } = require("./formatters/FichasTerminadas.js")
const { getEvaluationData } = require("./lib/getEvaluationData.js")
const { generateSummaryBaseDetalle } = require("./formatters/BaseDetalleSummary.js")
const { getCliente } = require("../model/cteData.js")
const { calcularMasterBgm } = require("./calcularBgm.js")
const { calcularMasterEasy } = require("./calcularEasy.js")
const { cteNuevoDisponibles,cteNuevoClavo } = require("./constants/nuevos.js")


const getDisponibles = ({ BaseDetalle, Pagos, fichasVigentes, cteData }) => {
    // console.log("Evaluando si es clavo",cteData.CTE,cteData);

    if (!fichasVigentes.length && !BaseDetalle.length) {
        if(cteData.ES_CLAVO) return cteNuevoClavo
        return cteNuevoDisponibles
    
    } //Si es cliente pero no hay ningun dato que evaluar
    // console.log({BaseDetalle,Pagos,fichasVigentes,cteData})

    const { fichas: fichasVigentesBgm, prestamos: fichasVigentesEasy } = splitPrestamosFichas(fichasVigentes)
    const { tomadoFichasBGM, tomadoFichasEasy, tomadoPrestamosBGM, tomadoPrestamosEasy } = calcularTomado({ fichasVigentesBgm, fichasVigentesEasy })

    const fichasVigentesAsBaseDetalle = fichasAsBaseDetalle(fichasVigentes,Pagos)

    const BaseDetalleConActivas = [...BaseDetalle, ...fichasVigentesAsBaseDetalle]
    
    const BaseDetalleResumen = generateSummaryBaseDetalle(BaseDetalleConActivas)

    const { fichas: BaseDetalleBgm, prestamos: BaseDetalleEasy } = splitPrestamosFichas(BaseDetalleConActivas)

    //Intentar traer desde getFichasVigentes
    const ratioCreditoVencido = fichasVigentes.reduce((acum, ficha) => acum + ficha.ratioCreditoVencido, 0)

    //Ver de donde lo puedo traer
    const promedioDiasDeAtraso = Pagos.reduce((acum, pago) => acum + pago.diasDeAtraso, 0) / Pagos.length || 0


    const ZInicial = getZInicial(BaseDetalleResumen);
    const ZFinal = calcularZFinal(ZInicial, BaseDetalleResumen.VIEJAS, BaseDetalleResumen.VALIDAS, Pagos, ratioCreditoVencido)

    const easy = calcularMasterEasy({ cteData, fichasVigentes, BaseDetalleResumen, BaseDetalleEasy, promedioDiasDeAtraso, fichasVigentesEasy, tomadoPrestamosEasy, tomadoFichasEasy, ZFinal })


    const bgm = calcularMasterBgm({ cteData, fichasVigentes, BaseDetalleResumen, BaseDetalleBgm , promedioDiasDeAtraso, fichasVigentesBgm, tomadoPrestamosBGM, tomadoFichasBGM, ZFinal, limiteEasy: easy.limite })



    const { MAXIMO_TOMADO = 0, PROMEDIO_TOMADO = 0, MINIMO_TOMADO = 0 } = BaseDetalleResumen
    //DisponibleFinalBGMDepende de el disponibleFinalDeEasyCash, por lo tanto agregar aca afuera
    const { disponible: disponibleEasy, incremento: incrementoEasy, limitante: limitanteEasy, limite: limiteEasy, disponibleFinal: disponibleFinalEasy } = easy
    const { disponible: disponibleBgm, incremento: incrementoBgm, limitante: limitanteBgm, limite: limiteBgm, disponibleFinal: disponibleFinalBgm, calificacion: calificacionBgm } = bgm

    return {
        ZInicial,
        ZFinal,
        MAXIMO_TOMADO,
        PROMEDIO_TOMADO,
        MINIMO_TOMADO,
        promedioDiasDeAtraso,
        ratioCreditoVencido,
        disponibleBgm,
        incrementoBgm,
        limitanteBgm,
        tomadoFichasBGM,
        tomadoFichasEasy,
        tomadoPrestamosBGM,
        tomadoPrestamosEasy,
        limiteBgm,
        disponibleFinalBgm,
        calificacionBgm,
        disponibleEasy,
        incrementoEasy,
        limitanteEasy,
        limiteEasy,
        disponibleFinalEasy
    }

}

//Calcula la calificacion del cliente, puede no tener en cuenta fichas en las fichas vigentes para simular
//disponubles anteriores
const getMaster = async (CTE, EXCEPCIONES) => {

    const [cteData] = await getCliente({ CTE })
    if (!cteData) return cteNuevoDisponibles //Si nunca existieron datos de ese cliente, enviar disponibles por defecto

    /*Consulto los datos para la evaluacion */
    const fichasVigentes = await getFichasVigentes(CTE, undefined,EXCEPCIONES)
    // console.log({fichasVigentes});
    
    const { BaseDetalle, pagos: Pagos } = await getEvaluationData(CTE)
    const disponible = getDisponibles({ BaseDetalle, cteData, Pagos, fichasVigentes })
    
    return { CTE, ...disponible }
}


// getMaster(25793).then(res => console.log("respuesta con solid", res))


const getMasterPorLote = async (listOfCte) => {
    // const listOfCteRaw = JSON.parse(fs.readFileSync("C:/A - Blanco GusMar/1 - Actual GusMar/Master acceso directo/ListaDeClientes.json")).CLIENTES;

    // const listOfCte = listOfCteRaw.slice(0, 1000);
    console.log("A");
    const cteDataArr = await getCliente({ CTE: listOfCte })

    const fichasVigentesArr = await getFichasVigentes(listOfCte);


    const { BaseDetalle: BaseDetalleArr, pagos: PagosArr } = await getEvaluationData(listOfCte)

    const createItArr = (datos) => {
        const indice = {};
        datos.forEach((elemento) => {
            const { CTE } = elemento;
            if (!indice[CTE]) {
                indice[CTE] = [];
            }
            indice[CTE].push(elemento);
        });
        return indice;
    }
    console.time("genera indices")

    const cteDataIT = createItArr(cteDataArr)
    const fichasVigentesIT = createItArr(fichasVigentesArr)
    const BaseDetalleIT = createItArr(BaseDetalleArr)
    const PagosIT = createItArr(PagosArr)

    console.timeEnd("genera indices")

    console.time("calificaciones")
    const disponibles = await Promise.all(listOfCte.map(async CTE => {

        const [cteData] = cteDataIT[CTE] || [];
        const fichasVigentes = fichasVigentesIT[CTE] || [];
        const BaseDetalle = BaseDetalleIT[CTE] || [];
        const Pagos = PagosIT[CTE] || [];



        // if(CTE == 1615){
        //     console.log({BaseDetalle,Pagos,fichasVigentes,cteData});
        // }

        const disponibles = getDisponibles({ BaseDetalle, cteData, fichasVigentes, Pagos })

        return { CTE, ...disponibles }

    }))

    console.timeEnd("calificaciones")
    return disponibles
}

// console.time("calificaciones por lote")
// getMasterPorLote().then(res => {
//     // console.log(res)
//     console.timeEnd("calificaciones por lote")
//     console.log("en ",res);
// })


module.exports = { getMaster, getMasterPorLote }