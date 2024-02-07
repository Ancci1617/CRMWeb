const pool = require("../../model/connection-database")

const getBaseDetalle = async ({ CTE ,Easy = false}) => {
    const [res] = await pool.query(
        `SELECT FECHA, CTE, FICHA, Z, VTA, 
        Atraso, Anticipo, CUOTA_1, CUOTA_2, CUOTA_3, CUOTA_4, CUOTA_5, 
        SAL_ANT, CUOTA_6, SAL_ACT, Cuota, PAGO_EN, VALOR_UNITARIO, 
        Mes, ORIGINALES, TEORICA, PRIMER_VENCIMIENTO, VENCIMIENTO,ESTADO,CAPITAL,CONCAT(CTE,'-',FICHA) as CODIGO  
        FROM basedetalle WHERE CTE = ? ${Easy ? "AND FICHA > 50000" : ""} order by FECHA desc`, [CTE])
    return res
}

const getPagosAcumulados = async ({ CTE ,Easy = false}) => {
    const [pagos] = await pool.query(`
    SELECT pm.CTE,pm.FICHA,VALOR,pm.FECHA,SERV,MORA,
    bd.CUOTA,bd.PRIMER_VENCIMIENTO,bd.VENCIMIENTO,bd.ORIGINALES,CONCAT(pm.CTE,'-',pm.FICHA) AS CODIGO  
    FROM pagossvmaster pm LEFT JOIN basedetalle bd on pm.CTE = bd.CTE and pm.FICHA = bd.FICHA WHERE pm.CTE = ? 
    ${Easy ? " AND pm.FICHA > 50000" : ''} AND bd.ESTADO = "ACTIVO";`,[CTE])
    return pagos
}

const getCliente = async ({CTE}) => {
    const [CTE_DATA] = await pool.query(`
    SELECT CTE, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, DNI, GARANTE_CTE, 
    DOMICILIO_LABORAL, EXCEPCION_DNI, ES_CLAVO, OBS FROM ClientesSV WHERE CTE = ?
    `, [CTE])
    return CTE_DATA
}





module.exports = { getBaseDetalle ,getPagosAcumulados,getCliente}