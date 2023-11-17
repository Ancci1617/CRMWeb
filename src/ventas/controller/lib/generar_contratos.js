
const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const PizZip = require("pizzip");
const path = require("path");




const generarContratoEasyCash = (datos_credito, datos_cte) => {
    const template = path.resolve("../DocumentosEasyCash/ContratoEasyCashModelo.docx");
    const contrato = path.resolve("../DocumentosEasyCash/ContratoEasyCash.docx");




    // Cargar el contenido del archivo Word
    const content = fs.readFileSync(template, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);


    // Datos a reemplazar en el documento Word
    const { ARTICULOS: CAPITAL, FICHA: PRESTAMO } = datos_credito;
    const data = Object.assign(
        datos_credito, datos_cte,
        { CAPITAL, PRESTAMO }
    );


    try {
        doc.render(data);
    } catch (error) {
        const e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
        };
        console.log(JSON.stringify({ error: e }));
        throw error;
    }

    const output = doc.getZip().generate({ type: 'nodebuffer' });

    // Guardar el archivo modificado
    fs.writeFileSync(contrato, output);
    return contrato

}









module.exports = { generarContratoEasyCash }