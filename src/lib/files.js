const fs = require("fs");

function saveFileFromEntry(fileEntries, CTE) {
    //ENTRIES = [ ["FRENTE",{OBJ}],["ROSTRO",{OBJ}]  ]
    //Entry =  ["FRENTE",{OBJ}]

    if (!fileEntries || !CTE) return null;

    //Genera la carpeta en caso que no exista
    try {
        if (!fs.existsSync(`../ImagenesDeClientes/${CTE}`))
            fs.mkdirSync(`../ImagenesDeClientes/${CTE}`);
    } catch (err) {
        return console.error("ERROR AL CREAR LA CARPETA DEL CLIENTE: ", err);
    }

    fileEntries.forEach(entry => {
        entry[1].mv(`../ImagenesDeClientes/${CTE}/CTE-${CTE}-${entry[0]}.jpg`,
            err => {
                if (err) console.log("Archivos no se cargó: ", CTE)
            });
    })

}

module.exports = {saveFileFromEntry}