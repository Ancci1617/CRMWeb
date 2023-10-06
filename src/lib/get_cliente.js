const pool = require("../model/connection-database.js");
const { getCteCalle,getCteDni,getCteFicha,getCteNombre,getCteTel,getCteCte } = require("../model/CRM/tipos/get_data_por_tipo")


const getCliente = async (request_data) => {
   
    const data = request_data.Data;
    const tipo = request_data.tipo_de_dato;

    switch(tipo) {
        case "Dni":
            return getCteDni(data);
        case "Ficha":
            return getCteFicha(data);
        case "Telefono":
            return getCteTel(data);
        case "Nombre":
            return getCteNombre(data);
        case "Calle":
            return getCteCalle(data);
        default:
            return getCteCte(data);
    }
    


}





module.exports = { getCliente }





