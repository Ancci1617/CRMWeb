const pool = require("../../model/connection-database")




const getLP = async () => {
    const [LP] = await pool.query(
        `SELECT
    Art,
    Producto,
    CONTADO,
    ANTICIPO,
    CUOTAS_3,
    CUOTAS_6,
    CUOTAS_9,
    CUOTAS_12,
    LAST_UPDATED,
    CONTADO + CUOTAS_3 + CUOTAS_6 + CUOTAS_9 + CUOTAS_12 > 0 as ESVALIDO    
FROM
    LP`)
    return LP
}

const editarProducto = async ({ Art, Producto, CONTADO, ANTICIPO, CUOTAS_3, CUOTAS_6, CUOTAS_9 }) => {
    const response = await pool.query(`UPDATE LP SET ? WHERE ?`, [{ Producto, CONTADO, ANTICIPO, CUOTAS_3, CUOTAS_6, CUOTAS_9 }, { Art }]);
    return response
}

const agregarProductoDB = async ({ Art, Producto, CONTADO, ANTICIPO, CUOTAS_3, CUOTAS_6, CUOTAS_9 }) => {
    const response = await pool.query(
        `INSERT INTO LP 
        (Art, Producto, CONTADO, ANTICIPO, CUOTAS_3, CUOTAS_6, CUOTAS_9)  
        VALUES 
        (?)`, [[Art, Producto, CONTADO, ANTICIPO, CUOTAS_3, CUOTAS_6, CUOTAS_9]])
    return response

}

const eliminarProductoDB = async (ART) => {
    const response = await pool.query(`DELETE FROM LP where Art = ?`,[ART]);
    return response;
}

module.exports = { getLP, editarProducto, agregarProductoDB ,eliminarProductoDB}



