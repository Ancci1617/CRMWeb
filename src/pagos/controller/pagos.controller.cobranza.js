const { getDoubt, getDebtEasy } = require("../../lib/doubt.js");
const pool = require("../../model/connection-database.js");
const pagosModel = require("../model/pagos.model.js");
const { getRendicion } = require("../model/rendicion.model.js");
const { getFichas } = require("../../model/CRM/get_tablas/get_fichas.js")

async function cargarCobranza(req, res) {
  const { FECHA = "", COB = "", ORDEN = "Z" } = req.query;
  const data = await pagosModel.getFechasDePagosYCobradores();
  const FECHAS = [...new Set(data.map(obj => obj.FECHA))];
  const render_links = FECHAS.map(fecha_evaluada => {
    return {
      FECHA: fecha_evaluada,
      COBRADORES: data.filter(obj => obj.FECHA == fecha_evaluada).map(obj => obj.COBRADOR)
    }
  });

  const pagos = await pagosModel.getPagosByFechaYCob({ COB, FECHA, ORDEN });
  const total_cobrado = pagos.reduce((accumulator, pago) => accumulator + pago.SERV + pago.CUOTA + pago.MORA, 0);
  const rendicion = await getRendicion({ COB, FECHA });

  res.render("pagos/pagos.cargar_cobranzas.ejs", { aside: render_links, pagos, total_cobrado, ORDEN, rendicion });
}

async function redistribuirPago(req, res) {
  const { SERV, CUOTA, MORA, PROXIMO, CODIGO } = req.body;
  const update_result = await pagosModel.updateDistribucionByCodigo({ PROXIMO, CUOTA, CODIGO, SERV, MORA });
  res.redirect(req.headers.referer || "/");
}


async function generarSaldoAnteriorServicio(req, res) {
  const FICHAS = await pagosModel.getFichasByCte();

  const deudas = FICHAS.map(ficha => {
    console.log(ficha)
    return { data: ficha, deuda: getDoubt(ficha) }
  });
  // const al_dia = deudas.filter(ficha => (ficha.deuda.atraso_evaluado === 0 && ficha.data.SERV_PAGO > 0));
  const al_dia = deudas.filter(ficha => (ficha.deuda.atraso_evaluado === 0));

  const NUMEROS_DE_FICHAS = al_dia.map(ficha => ficha.data.FICHA);
  const resultado = await pagosModel.updateSaldosAnterioresYServicios(NUMEROS_DE_FICHAS);

  res.json(resultado);
}

async function rendicionController(req, res) {
  const cobranza = await pagosModel.getPagosByFechaYCob({ COB: "COBRADOR", FECHA: "2023-07-19" });




  res.json({ rendicion: 1 })
}

const getCobranzasEasy = async (req, res) => {
  let cobranzas = await getFichas("FICHA", "5____");
  for (let i = 0; i < cobranzas.length; i++) {
    delete cobranzas[i].FECHA_FORMAT;
  }

  const cobranzas_final = cobranzas.filter(ficha => ficha.FICHA >= 50000).map(ficha => {
    const {
      cuota: deuda_cuota,
      servicio: deuda_serv,
      mora: deuda_mora,
      vencimiento_vigente, EsPrimerPago
    } = getDebtEasy(ficha);

    return Object.assign(ficha, { deuda_cuota, deuda_serv, deuda_mora, vencimiento_vigente, EsPrimerPago });
  })

  console.log(cobranzas_final.filter(ficha => ficha.FICHA == 50555)[0]);

  res.json(cobranzas_final.filter(ficha => ficha.FICHA >= 50000));


}

const getCobranzas = async (req, res) => {
  let cobranzas = await getFichas("FICHA", "____");
  for (let i = 0; i < cobranzas.length; i++) {
    delete cobranzas[i].FECHA_FORMAT
    delete cobranzas[i].ARTICULOS
  }

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






module.exports = { cargarCobranza, redistribuirPago, generarSaldoAnteriorServicio, rendicionController, getCobranzas, getCobranzasEasy };

