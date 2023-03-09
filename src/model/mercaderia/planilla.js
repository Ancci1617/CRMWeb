const pool = require("../connection-database");

const getPlanillaDeCarga = async (vendedor,fecha)=>{

    const [result] = await pool.query(
        "Select CTE,FICHA,ANTICIPO,TOTAL,ESTATUS,ARTICULOS,USUARIO from VentasCargadas " + 
        "where USUARIO = ? and FECHA_VENTA = ?",[vendedor,fecha]);

    return result;

}



module.exports = {getPlanillaDeCarga}



