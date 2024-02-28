const { getFechasDePagosYCobradores } = require("../model/pagos.model");

const getAside = async () => {

    const data = await getFechasDePagosYCobradores();
    const FECHAS = [...new Set(data.map(obj => obj.FECHA))];

    const aside = FECHAS.map(fecha_evaluada => {
      return {
        titulo: fecha_evaluada,
        VINCULOS: data.filter(obj => obj.FECHA == fecha_evaluada).map(obj => {
          return  {titulo : obj.COBRADOR,COB : obj.COBRADOR,FECHA : fecha_evaluada}
        }),        
      }
    });
    
    return aside

}

module.exports = {getAside}