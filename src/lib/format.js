
function formatPorcentaje(texto) {
    return texto.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ",");
}
function truncar(expression,decimales) {
    return Math.trunc(expression * 10 * decimales) / 10 * decimales
}
module.exports = {

    formatPorcentaje
,truncar

}



