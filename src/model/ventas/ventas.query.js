const pool = require("../../model/connection-database");

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
        "SELECT `CTE`, `FICHA`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`WHATSAPP`, `DNI`, `ARTICULOS`, `ANTICIPO`, `CUOTAS`, " +
        "`CUOTA`,`TOTAL`,`VENCIMIENTO`, `PRIMER_PAGO`, `TIPO`, " +
        "`ESTATUS`,  `RESPONSABLE`, `APROBADO` FROM `VentasCargadas` " +
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
    const [fechas] = await pool.query("SELECT DISTINCT FECHA_VENTA from VentasCargadas");

    if (fechas.length > 0) {
        return fechas;
    }

    return [];
}

module.exports = { getVentasDelDia, borrarVentasDelDia, getVentasVendedores ,getVendedores,getFechaDeVentas }