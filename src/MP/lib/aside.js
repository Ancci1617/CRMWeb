const { getToday } = require("../../lib/dates.js");
const { getUsuariosWithMp } = require("../../model/auth/getUser.js");

const getAside = async (user) => {

    const today = new Date(getToday());
    const FECHAS = [
        new Date(today.getFullYear(), today.getUTCMonth(), 1).toISOString().substring(0, 7),
        new Date(today.getFullYear(), today.getUTCMonth() - 1, 1).toISOString().substring(0, 7),
        new Date(today.getFullYear(), today.getUTCMonth() - 2, 1).toISOString().substring(0, 7),
        new Date(today.getFullYear(), today.getUTCMonth() - 3, 1).toISOString().substring(0, 7),
        new Date(today.getFullYear(), today.getUTCMonth() - 4, 1).toISOString().substring(0, 7),
        new Date(today.getFullYear(), today.getUTCMonth() - 5, 1).toISOString().substring(0, 7),
        new Date(today.getFullYear(), today.getUTCMonth() - 6, 1).toISOString().substring(0, 7)
    ]

    const usuarios = !user ? await getUsuariosWithMp() : [user];



    const aside = FECHAS.map(FECHA => {
        return {
            titulo: FECHA,
            // VINCULOS: usuarios.map(usuario => ({ titulo : usuario, INDICE: usuario.Usuario,MP_TITULAR : usuario.Usuario,MES : FECHA }))
            VINCULOS: usuarios.map(usuario => ({ titulo : usuario.Usuario,MP_TITULAR : usuario.Usuario,MES : FECHA }))
        }
    });
    return aside
}

module.exports = { getAside }