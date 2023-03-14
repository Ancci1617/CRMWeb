const pool = require("../../model/connection-database");

async function getArchivoDeEntregaVentas(vendedor,dia) {
    const [ventas] = await pool.query(
        "Select FECHA_VENTA,CTE,FICHA,ZONA,TOTAL,null as n1,null as n2,'formula' as n3,'formula' as n4, "+
        "CUOTA,null as n5,'formula' as n6,'formula' as n7,'formula' as n8,tipo,ESTATUS,PRIMER_PAGO,NULL as n9,NULL as n10, " + 
        "'formula' as n11,'formula' as n12,'formula' as n13,'formula' as n14,'formula' as n15,'formula' as n16 ,'formula' as n17," + 
        "'formula' as n18,'formula' as n19,'formula' as n20,'formula' as n21,null as n22, " + 
        "Concat(year(FECHA_VENTA),'-',Month(FECHA_VENTA),'-',VENCIMIENTO) as VENCIMIENTO from VentasCargadas where " + 
        "USUARIO = ? and FECHA_VENTA = ? ", [vendedor,dia])

    if (ventas.length > 0) {
        return ventas;
    }
    return [];

}


async function getArchivoDeEntregaAccess(vendedor,dia) {
    const [ventas] = await pool.query(
        "Select FECHA_VENTA,CTE,FICHA,NOMBRE,ZONA,CALLE,NULL as n1,NULL as n2,WHATSAPP, "+
        "DNI,ARTICULOS,TOTAL,ANTICIPO,CUOTA,TIPO,ESTATUS,PRIMER_PAGO,Usuario from VentasCargadas "+
        "where USUARIO = ? and FECHA_VENTA = ?"
        ,[vendedor,dia])

    if (ventas.length > 0) {
        return ventas;
    }
    return [];

}



module.exports = {getArchivoDeEntregaVentas, getArchivoDeEntregaAccess}

