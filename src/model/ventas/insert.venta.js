const pool = require("../connection-database");

const insertVenta = async (parametros) => {
    
    
    const [response] = await pool.query(
        "INSERT INTO `VentasCargadas` " + 
        "(`CTE`, `FICHA`, `NOMBRE`, `ZONA`, `CALLE`,`CRUCES`,`CRUCES2`, `WHATSAPP`, `DNI`, " + 
        "`CUOTAS`, `ARTICULOS`, `TOTAL`,`CUOTA`, `ANTICIPO`,`TIPO`, "+
        "`ESTATUS`, `PRIMER_PAGO`, `VENCIMIENTO`, `CUOTAS_PARA_ENTREGA`, `FECHA_VENTA`, `RESPONSABLE`,`APROBADO`,`USUARIO`) "+
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
        ,parametros);

    if (response > 0) {
        return response;
    }

    return [];

}

module.exports = { insertVenta }




