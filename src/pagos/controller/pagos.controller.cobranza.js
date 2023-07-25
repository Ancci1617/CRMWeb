const { getDoubt } = require("../../lib/doubt.js");
const pool = require("../../model/connection-database.js");
const { pagosModel } = require("../model/pagos.model.js");


async function cargarCobranza(req, res) {
  const { FECHA = "", COB = "",ORDEN = "Z" } = req.query;
  const data = await pagosModel.getFechasDePagosYCobradores();
  const FECHAS = [...new Set(data.map(obj => obj.FECHA))];
  const render_links = FECHAS.map(fecha_evaluada => {
    return {
      FECHA: fecha_evaluada,
      COBRADORES: data.filter(obj => obj.FECHA == fecha_evaluada).map(obj => obj.COBRADOR)
    }
  });

  const pagos = await pagosModel.getPagosByFechaYCob({ COB, FECHA,ORDEN });
  const total_cobrado = pagos.reduce((accumulator, pago) => accumulator + pago.SERV + pago.CUOTA + pago.MORA, 0);

  res.render("pagos/pagos.cargar_cobranzas.ejs", { aside: render_links, pagos, total_cobrado,ORDEN });
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
  const al_dia = deudas.filter(ficha => (ficha.deuda.atraso_evaluado === 0 && ficha.data.SERV_PAGO > 0));


  const NUMEROS_DE_FICHAS = al_dia.map(ficha => ficha.data.FICHA)
  const resultado = await pagosModel.updateSaldosAnterioresYServicios(NUMEROS_DE_FICHAS);

  res.json(resultado);
}

async function rendicionController(req, res) {
  const cobranza = await pagosModel.getPagosByFechaYCob({ COB: "COBRADOR", FECHA: "2023-07-19" });




  res.json({ rendicion: 1 })
}










module.exports = { cargarCobranza, redistribuirPago, generarSaldoAnteriorServicio, rendicionController };

