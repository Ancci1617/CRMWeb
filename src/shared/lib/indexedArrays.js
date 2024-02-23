const createIndexedOfArr = (datos,property) => {

    const indice = {};
    datos.forEach((elemento) => {
        const dataToIndex  = elemento[property];

        if (!indice[dataToIndex]) {
            indice[dataToIndex] = [];
        }
        indice[dataToIndex].push(elemento);
    });
    return indice;

}


const createIndexed = () => {




}


module.exports = {createIndexedOfArr}