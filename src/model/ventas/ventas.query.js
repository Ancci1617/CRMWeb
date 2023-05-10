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
        "? AND USUARIO = ? AND VISIBLE = 1  AND (MODO != 'CONTADO' or MODO IS NULL) ORDER BY FICHA", [dia, usuario])

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
    //CORREGIR QUE LA COLUMNA "MOTIVO" NO SEA NULL EN NINGUN LADO, QUE SEA BGM O CONTADO
    const [ventas] = await pool.query(
        "SELECT `APROBADO`,`CTE`, `FICHA`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`WHATSAPP`, `DNI`, `ARTICULOS`, `ANTICIPO`, `CUOTAS`, " +
        "`CUOTA`,`TOTAL`,`VENCIMIENTO`, `PRIMER_PAGO`, `TIPO`, " +
        "`ESTATUS`,  `RESPONSABLE` FROM `VentasCargadas` " +
        "where USUARIO = ? AND FECHA_VENTA = ? AND VISIBLE = 1 AND MODO != 'CONTADO'"
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
        await pool.query("UPDATE `NCTE` SET `TOMADO`='1' WHERE CTE = ?", [CTE[0].CTE]);
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
        "where FECHA_VENTA = ? AND VISIBLE = 1 AND (MODO != 'CONTADO' or MODO IS NULL) ORDER BY FICHA"
        , [fecha])

    if (ventas.length > 0) {
        return ventas;
    }

    return [];
}

async function getVentasContado(fecha) {

    const [ventas] = await pool.query(
        "SELECT `NOMBRE`, `ZONA`, `CALLE`, `WHATSAPP`, `DNI`, `ARTICULOS`, `TOTAL`, `TIPO`, " +
        "`ESTATUS`, `FECHA_VENTA`,  `APROBADO`, `USUARIO`, `MODO`, `INDICE` FROM `VentasCargadas` " +
        "WHERE VISIBLE = 1 and FECHA_VENTA = ? and MODO = 'CONTADO'"
        , [fecha])

    if (ventas.length > 0) {
        return ventas;
    }

    return [];
}
async function getFechaDeVentasContado() {
    const [fechas] = await pool.query(
        "SELECT DISTINCT FECHA_VENTA AS FECHA from VentasCargadas where VISIBLE = 1 and MODO = 'CONTADO' ORDER BY FECHA DESC"
    );

    if (fechas.length > 0) {
        return fechas;
    }

    return [];
}

async function deleteVentasContado(ID) {
    //Invisible la venta
    await pool.query("UPDATE `VentasCargadas` SET `VISIBLE`='0' WHERE `INDICE` = ?", [ID]);
    //Borrar del stock
    await pool.query("DELETE FROM STOCK WHERE ID_VENTA = ?", [ID]);

}

module.exports = {
    getVentasDelDia, borrarVentasDelDia,
    getVentasVendedores, getVendedores,
    getFechaDeVentas, getVentasDelDiaGeneral,
    getVendedoresConVentas, getNuevoNumeroDeCte,
    getVentasContado, getFechaDeVentasContado, deleteVentasContado
}

