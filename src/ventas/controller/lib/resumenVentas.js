

const generarResumenDeVentas = (ventas) => {

    return ventas.reduce((acum, venta) => {
        const { USUARIO, TOTAL, ARTICULOS } = venta;

        if (!acum.VENDEDORES[USUARIO]) acum.VENDEDORES[USUARIO] = 0;

        acum.VENDEDORES[USUARIO] += TOTAL


        return {
            ...acum, 
            TOTAL: acum.TOTAL + TOTAL,
            COLOCADO: acum.COLOCADO + parseInt(ARTICULOS)
        }

    }, { TOTAL: 0, COLOCADO: 0 ,VENDEDORES : {}})
}



module.exports = { generarResumenDeVentas }

