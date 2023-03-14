const pool = require("../connection-database");

const insertVenta = async (parametros,usuario) => {
    
    const resultados = Object.entries(parametros).map(e=> e[1]);
    resultados.push(usuario)
    
    const [response] = await pool.query(
        "INSERT INTO `VentasCargadas` " + 
        "(`CTE`, `FICHA`, `NOMBRE`, `ZONA`, `CALLE`,`CRUCES`,`CRUCES2`, `WHATSAPP`, `DNI`, " + 
        "`CUOTAS`, `ARTICULOS`, `TOTAL`,`CUOTA`, `ANTICIPO`,`TIPO`, "+
        "`ESTATUS`, `PRIMER_PAGO`, `VENCIMIENTO`, `CUOTAS_PARA_ENTREGA`, `FECHA_VENTA`, `RESPONSABLE`,`APROBADO`,`USUARIO`) "+
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
        ,resultados);

    if (response > 0) {
        return response;
    }

    return [];

}

module.exports = { insertVenta }




