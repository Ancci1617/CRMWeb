const pool = require("../model/connection-database.js");
const { getPrecioCuotas12,getPrecioCuotas9,getPrecioCuotas6,getPrecioCuotas3,getPrecioCuotasContado }  = require("../model/productos/precios");


const getPrecio = async (articulo,cuotas) => {


    switch(cuotas) {
        case "1":
            return getPrecioCuotasContado(articulo);
        case "3":
            return getPrecioCuotas3(articulo);
        case "6":
            return getPrecioCuotas6(articulo);
        case "9":
            return getPrecioCuotas9(articulo);
        case "12":
            return getPrecioCuotas12(articulo);
        default:
            return {PRECIO : 0};
    }
    


}





module.exports = { getPrecio }





