const { getAsideMp } = require("../model/mercadoPagoModel.js");
const { getToday } = require("../../lib/dates.js");
const { getUsuariosWithMp } = require("../../model/auth/getUser.js");

const getAside = async () => {
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


    // let dayIterator = new Date(today.getUTCFullYear(), today.getMonth() - 3, 0, today.getUTCDate());
    // while (dayIterator <= today) {
    //     FECHAS.push(dayIterator.toISOString().split("T")[0] );
    //     dayIterator.setDate(dayIterator.getUTCDate() + 1);
    // }

    // FECHAS.reverse();


    const usuarios = await getUsuariosWithMp();

    const aside = FECHAS.map(FECHA => {
        return {
            TITULO: FECHA,
            VINCULOS: usuarios.map(usuario => ({ INDICE: usuario.Usuario,MP_TITULAR : usuario.Usuario,MES : FECHA }))

            // VINCULOS: ventas.filter(venta => venta.FECHA == FECHA).map(ventas => ventas.USUARIO)
        }
    });
    return aside
}

module.exports = { getAside }