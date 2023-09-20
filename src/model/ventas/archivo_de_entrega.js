const pool = require("../../model/connection-database");

async function getArchivoDeEntregaVentas(vendedor, dia) {
    const [ventas] = await pool.query(
        "Select FECHA_VENTA, VentasCargadas.CTE, VentasCargadas.FICHA, ZONA, VentasCargadas.TOTAL, null as n1, "+
        "null as n2, 'formula' as n3, 'formula' as n4, VentasCargadas.CUOTA, null as n5, 'formula' as n6, "+
        "'formula' as n7, 'formula' as n8, tipo, ESTATUS, Fichas.PRIMER_PAGO, NULL as n9, NULL as n10, "+
        "'formula' as n11, 'formula' as n12, 'formula' as n13, 'formula' as n14, 'formula' as n15, "+
        "'formula' as n16, 'formula' as n17, 'formula' as n18, 'formula' as n19, 'formula' as n20, "+
        "'formula' as n21, null as n22, " +
        " Fichas.VENCIMIENTO " + 
        "from VentasCargadas LEFT JOIN Fichas on Fichas.ID_VENTA = VentasCargadas.INDICE where USUARIO = ? and FECHA_VENTA = ? and VISIBLE = 1 order by FICHA;", [vendedor, dia])

    if (ventas.length > 0) {
        return ventas;
    }
    return [];

}


async function getArchivoDeEntregaAccess(vendedor, dia) {
    const [ventas] = await pool.query(
        "Select FECHA_VENTA,CTE,FICHA,NOMBRE,ZONA,CALLE,CRUCES,CRUCES2,WHATSAPP, " +
        "DNI,ARTICULOS,TOTAL,ANTICIPO,CUOTA,TIPO,ESTATUS,PRIMER_PAGO,Usuario from VentasCargadas " +
        "where USUARIO = ? and FECHA_VENTA = ? and VISIBLE = 1 order by FICHA"
        , [vendedor, dia])

    if (ventas.length > 0) {
        return ventas;
    }
    return [];

}



module.exports = { getArchivoDeEntregaVentas, getArchivoDeEntregaAccess }

