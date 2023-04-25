const pool = require("../../model/connection-database");

async function getVendedoresConVentas(dia) {
    const [vendedores] = await pool.query(
        "Select distinct `USUARIO` AS VENDEDOR from " + 
        "VentasCargadas where FECHA_VENTA = ? and VISIBLE = 1", [dia])

    if (vendedores.length > 0) {
        return vendedores;
    }
    return ["sin vendedores"];

}

async function getVentasDelDia(dia, usuario) {

    const [ventas] = await pool.query(
        "SELECT `CTE`, `FICHA`, `ZONA`, `NOMBRE`, " +
        "`CALLE`,`WHATSAPP`,`DNI`,`ARTICULOS`,`CUOTAS`,`CUOTA`,`TOTAL`, " +
        "`VENCIMIENTO`,`PRIMER_PAGO`,`APROBADO`, `RESPONSABLE`,`INDICE` " +
        "FROM VentasCargadas WHERE `FECHA_VENTA` = " +
        "? AND USUARIO = ? AND VISIBLE = 1", [dia, usuario])

    if (ventas.length > 0) {
        return ventas;
    }
    return 0;

}

async function borrarVentasDelDia(indice, usuario) {
    const [result] = await pool.query(
        "UPDATE `VentasCargadas` SET `VISIBLE`='0' " +
        "WHERE INDICE = ? and USUARIO = ?"
        , [indice, usuario])

    return result;
}

async function getVentasVendedores(vendedor, fecha) {

    const [ventas] = await pool.query(
        "SELECT `APROBADO`,`CTE`, `FICHA`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`WHATSAPP`, `DNI`, `ARTICULOS`, `ANTICIPO`, `CUOTAS`, " +
        "`CUOTA`,`TOTAL`,`VENCIMIENTO`, `PRIMER_PAGO`, `TIPO`, " +
        "`ESTATUS`,  `RESPONSABLE` FROM `VentasCargadas` " +
        "where USUARIO = ? AND FECHA_VENTA = ? AND VISIBLE = 1"
        , [vendedor, fecha])


    if (ventas.length > 0) {
        return ventas;
    }

    return [];
}

async function getVendedores() {
    const [ventas] = await pool.query("SELECT DISTINCT Usuario as VENDEDOR from VentasCargadas");

    if (ventas.length > 0) {
        return ventas;
    }

    return [];
}

async function getFechaDeVentas() {
    const [fechas] = await pool.query(
        "SELECT DISTINCT FECHA_VENTA AS FECHA from VentasCargadas where VISIBLE = 1 ORDER BY FECHA DESC"
        );

    if (fechas.length > 0) {
        return fechas;
    }

    return [];
}
//SELECT MIN(CTE) AS CTE FROM `NCTE` where tomado = false;
async function getNuevoNumeroDeCte() {
    const [CTE] = await pool.query(
        "SELECT MIN(CTE) AS CTE FROM `NCTE` where tomado = false;"
        );

    if (CTE.length > 0) {
        await pool.query("UPDATE `NCTE` SET `TOMADO`='1' WHERE CTE = ?",[CTE[0].CTE]);
        return CTE[0].CTE;
    }

    return [];
}


async function getVentasDelDiaGeneral(fecha) {

    const [ventas] = await pool.query(
        "SELECT `APROBADO`,`CTE`, `FICHA`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`WHATSAPP`, `DNI`, `ARTICULOS`, `ANTICIPO`, `CUOTAS`, " +
        "`CUOTA`,`TOTAL`,`VENCIMIENTO`, `PRIMER_PAGO`, `TIPO`, " +
        "`ESTATUS`,  `RESPONSABLE` FROM `VentasCargadas` " +
        "where FECHA_VENTA = ? AND VISIBLE = 1 ORDER BY FICHA"
        , [fecha])

    if (ventas.length > 0) {
        return ventas;
    }

    return [];
}



module.exports = {
    getVentasDelDia, borrarVentasDelDia,
    getVentasVendedores, getVendedores, 
    getFechaDeVentas, getVentasDelDiaGeneral, 
    getVendedoresConVentas,getNuevoNumeroDeCte
}

