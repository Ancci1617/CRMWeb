const { getDoubt, getDebtEasy } = require("../../lib/doubt.js");
const pool = require("../../model/connection-database.js");
const pagosModel = require("../model/pagos.model.js");
const { getRendicion } = require("../model/rendicion.model.js");
const { getFichas } = require("../../model/CRM/get_tablas/get_fichas.js");
const { getAside } = require("../lib/aside.js");

async function cargarCobranza(req, res) {
  const { FECHA = "", COB = "", ORDEN = "Z" } = req.query;

  const aside = await getAside()


  const pagos = await pagosModel.getPagosByFechaYCob({ COB, FECHA, ORDEN });
  const total_cobrado = pagos.reduce((accumulator, pago) => accumulator + pago.SERV + pago.CUOTA + pago.MORA, 0);
  const rendicion = await getRendicion({ COB, FECHA });

  res.render("pagos/pagos.cargar_cobranzas.ejs", { aside, pagos, total_cobrado, ORDEN, rendicion });
}

async function redistribuirPago(req, res) {
  const { SERV, CUOTA, MORA, PROXIMO, CODIGO } = req.body;
  const update_result = await pagosModel.updateDistribucionByCodigo({ PROXIMO, CUOTA, CODIGO, SERV, MORA });
  res.redirect(req.headers.referer || "/");
}


async function generarSaldoAnteriorServicio(req, res) {
  const FICHAS = await pagosModel.getFichasByCte();

  const deudas = FICHAS.map(ficha => {
    return { data: ficha, deuda: getDoubt(ficha) }
  });
  // const al_dia = deudas.filter(ficha => (ficha.deuda.atraso_evaluado === 0 && ficha.data.SERV_PAGO > 0));
  const al_dia = deudas.filter(ficha => (ficha.deuda.atraso_evaluado === 0));

  const NUMEROS_DE_FICHAS = al_dia.map(ficha => ficha.data.FICHA);
  const resultado = await pagosModel.updateSaldosAnterioresYServicios(NUMEROS_DE_FICHAS);

  res.json(resultado);
}



const getCobranzasEasy = async (req, res) => {
  console.log("Consulta cobranzas EasyCash");
  let cobranzas = await getFichas("FICHA", "5____");
  for (let i = 0; i < cobranzas.length; i++) {
    delete cobranzas[i].FECHA_FORMAT;
  }
  console.log("calcula deuda");
  const cobranzas_final = cobranzas.map(ficha => {
    const {
      cuota: deuda_cuota,
      servicio: deuda_serv,
      mora: deuda_mora,
      vencimiento_vigente, EsPrimerPago
    } = getDebtEasy(ficha);

    return { ...ficha, deuda_cuota, deuda_serv, deuda_mora, vencimiento_vigente, EsPrimerPago };
  })


  res.json(cobranzas_final);


}

const getCobranzas = async (req, res) => {

  const promises = [
    getFichas("FICHA", "3000", "<"),
    getFichas("FICHA", "3000", ">=", "Fichas.FICHA < 5000"),
    getFichas("FICHA", "5000", ">=", "Fichas.FICHA < 7000"),
    getFichas("FICHA", "7000", ">=", "Fichas.FICHA < 8000"),
    getFichas("FICHA", "8000", ">=", "Fichas.FICHA < 20000")
  ]
  console.log("Calculando cobranzas.");
  const cobranzas = (await Promise.all(promises)).flat();

  for (let i = 0; i < cobranzas.length; i++) {
    delete cobranzas[i].FECHA_FORMAT
  }
  console.log("calcula deudas");
  const cobranzas_final = cobranzas.map(ficha => {
    const {
      cuota: deuda_cuota,
      servicio: deuda_serv,
      mora: deuda_mora,
      vencimiento_vigente, EsPrimerPago
    } = getDoubt(ficha);


    return Object.assign(ficha, { deuda_cuota, deuda_serv, deuda_mora, vencimiento_vigente, EsPrimerPago });
  })

  res.json(cobranzas_final)
}






module.exports = { cargarCobranza, redistribuirPago, generarSaldoAnteriorServicio, getCobranzas, getCobranzasEasy };

