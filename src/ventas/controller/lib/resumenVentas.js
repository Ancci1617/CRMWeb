

const generarResumenDeVentas = (ventas) => {

    const resumen = ventas.reduce((acum, venta) => {
        const { USUARIO, TOTAL, ARTICULOS } = venta;

        if (!acum.VENDEDORES[USUARIO]) {
            acum.VENDEDORES[USUARIO] = { TOTAL: 0, CANTIDAD: 0 };
        }

        acum.VENDEDORES[USUARIO] = {
            TOTAL: acum.VENDEDORES[USUARIO].TOTAL + TOTAL,
            CANTIDAD: acum.VENDEDORES[USUARIO].CANTIDAD + 1
        }


        return {
            ...acum,
            TOTAL: acum.TOTAL + TOTAL,
            COLOCADO: acum.COLOCADO + parseInt(ARTICULOS)
        }

    }, { TOTAL: 0, COLOCADO: 0, VENDEDORES: {} })


    return resumen
}



module.exports = { generarResumenDeVentas }

