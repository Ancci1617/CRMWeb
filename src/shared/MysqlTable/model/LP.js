const pool = require("../../../model/connection-database");

const getArticulos = async (articulos = []) => {
    

    const [lp] = await pool.query(`
    SELECT Art,Producto,CONTADO,CUOTAS_3,CUOTAS_6,CUOTAS_9,CUOTAS_12,ANTICIPO FROM LP where Art in (?)`,[articulos])
    
    return lp
} 


module.exports = {getArticulos}
