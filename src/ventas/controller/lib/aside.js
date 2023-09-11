const { getAsideVentas } = require("../../model/ventas.model.js");

const getAside = async () => {

    const ventas = await getAsideVentas();
    const FECHAS  = [...new Set(ventas.map(venta => venta.FECHA))];
    const aside = FECHAS.map(FECHA => {
        return {
          FECHA,
          VINCULOS: ventas.filter(venta => venta.FECHA == FECHA).map(ventas => ventas.USUARIO)
        }
      });

    return aside
}

module.exports = {getAside}