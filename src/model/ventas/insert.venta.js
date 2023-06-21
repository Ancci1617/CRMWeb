const { response } = require("express");
const pool = require("../connection-database");

const insertVenta = async (...parametros) => {


    const [response] = await pool.query(
        "INSERT INTO `VentasCargadas` " +
        "(`CTE`, `FICHA`, `NOMBRE`, `ZONA`, `CALLE`, `CRUCES`, `CRUCES2`, `WHATSAPP`, `DNI`, `ARTICULOS`, " +
        "`TOTAL`, `ANTICIPO`, `CUOTA`, `CUOTAS`, `TIPO`, `ESTATUS`, `PRIMER_PAGO`, `VENCIMIENTO`, " +
        "`CUOTAS_PARA_ENTREGA`, `FECHA_VENTA`, `RESPONSABLE`, `APROBADO`, `USUARIO`, `MODO`) " +
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
        , parametros);

    return response;
}

const updateVentaById = async ({ CTE, FICHA, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2,
    WHATSAPP, DNI, ARTICULOS, TOTAL, ANTICIPO, CUOTA, CUOTAS, TIPO, ESTATUS,
    PRIMER_PAGO , VENCIMIENTO, CUOTAS_PARA_ENTREGA,FECHA_VENTA,RESPONSABLE,APROBADO,ID}) => {

    const [response] = await pool.query(
        "UPDATE `VentasCargadas` SET `CTE`=?,`FICHA`=?,`NOMBRE`=?,`ZONA`=?, "+
        "`CALLE`=?,`CRUCES`=?,`CRUCES2`=?,`WHATSAPP`=?,`DNI`=?,`ARTICULOS`=?,"+
        "`TOTAL`=?,`ANTICIPO`=?,`CUOTA`=?,`CUOTAS`=?,`TIPO`=?,`ESTATUS`=?,"+
        "`PRIMER_PAGO`=?,`VENCIMIENTO`=?,`CUOTAS_PARA_ENTREGA`=?,`FECHA_VENTA`=?,"+
        "`RESPONSABLE`=?,`APROBADO`=? "+
        "WHERE INDICE = ?"
        , [CTE,FICHA,NOMBRE,ZONA,CALLE,CRUCES,CRUCES2,WHATSAPP,DNI,ARTICULOS,TOTAL,ANTICIPO,CUOTA,CUOTAS
            ,TIPO,ESTATUS,PRIMER_PAGO,VENCIMIENTO,CUOTAS_PARA_ENTREGA,FECHA_VENTA,RESPONSABLE,APROBADO,ID]);


    return response;
};



module.exports = { insertVenta ,updateVentaById}




