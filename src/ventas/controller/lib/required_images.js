const fs = require("fs");

const getRequiredImages = (CTE) => {
    const required_images = { frente: true, dorso: true, rostro: true };
    if (fs.existsSync(`../ImagenesDeClientes/${CTE}`)) {
        required_images.frente = !fs.existsSync(`../ImagenesDeClientes/${CTE}/CTE-${CTE}-FRENTE.jpg`);
        required_images.dorso = !fs.existsSync(`../ImagenesDeClientes/${CTE}/CTE-${CTE}-DORSO.jpg`);
        required_images.rostro = !fs.existsSync(`../ImagenesDeClientes/${CTE}/CTE-${CTE}-ROSTRO.jpg`);
    }
    return required_images;

}

module.exports = { getRequiredImages }