
function formatPorcentaje(texto) {
    return texto.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ",");
}

module.exports = {

    formatPorcentaje


}



