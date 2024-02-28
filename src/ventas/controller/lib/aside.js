const { getAsideVentas } = require("../../model/ventas.model.js");

const getAside = async () => {

    const ventas = await getAsideVentas();
    const FECHAS  = [...new Set(ventas.map(venta => venta.FECHA))];
    const aside = FECHAS.map(FECHA => {
        
      return {
          titulo : FECHA,
          VINCULOS: ventas.filter(venta => venta.FECHA == FECHA)
          .map(venta => {
            return {titulo : venta.USUARIO,USUARIO : venta.USUARIO,FECHA_VENTA : venta.FECHA}
          }).concat({titulo : "General",USUARIO : "General",FECHA_VENTA : FECHA})
        }

      });

    return aside
}

module.exports = {getAside}