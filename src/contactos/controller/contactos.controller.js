
const {generarContactoCte} = require("../model/contactos.model.js")


const ventaCargada = async ({CTE,WHATSAPP, ID_VENTA}) => {
    try {
        console.log("por cargar contacto",{CTE,WHATSAPP, ID_VENTA});
        const sqlResponde = await generarContactoCte({CTE,WHATSAPP,ID_VENTA})
        // console.log(sqlResponde);

    } catch (error) {
        
        console.log(error);

    }
}








module.exports = {ventaCargada}





