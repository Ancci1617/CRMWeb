const pool = require("../../model/connection-database");

async function getVentasDelDia(dia,usuario){

    
    const [ventas] = await pool.query(
        "SELECT `CTE`, `FICHA`, `ZONA`, `NOMBRE`, " + 
        "`CALLE`,`WHATSAPP`,`DNI`,`ARTICULOS`,`CUOTAS`,`CUOTA`,`TOTAL`, " + 
        "`VENCIMIENTO`,`PRIMER_PAGO`,`APROBADO`, `RESPONSABLE`,`INDICE` " + 
        "FROM VentasCargadas WHERE `FECHA_VENTA` = " + 
        "? AND USUARIO = ? AND VISIBLE = 1",[dia,usuario])
   
    if(ventas.length > 0){
        return ventas;
    }
    return 0;
    
}

async function borrarVentasDelDia(indice,usuario){
    const [result] = await pool.query(
        "UPDATE `VentasCargadas` SET `VISIBLE`='0' " + 
        "WHERE INDICE = ? and USUARIO = ?"
        ,[indice,usuario])
    
    return result;
}

module.exports = { getVentasDelDia, borrarVentasDelDia }