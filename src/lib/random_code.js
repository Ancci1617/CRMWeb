function getRandomCode(length = 8) {
    let caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let codigo = '';
    for (var i = 0; i < length; i++) {
        var indice = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres.charAt(indice);
    }

    return codigo;
}


module.exports = { getRandomCode };