const pool = require("../../model/connection-database")


//Toda la base detalle de el array de clientes EXCEPTO las que son devolucion de EasyCash
const getBaseDetalle = async ({ CTE, Easy = false, orderBy = "FECHA", order = "asc", filterDevEasyCash = false }) => {
    const [res] = await pool.query(
        `SELECT FECHA, CTE, FICHA, Z, VTA, 
        Atraso, Anticipo, CUOTA_1, CUOTA_2, CUOTA_3, CUOTA_4, CUOTA_5, 
        SAL_ANT, CUOTA_6, SAL_ACT, Cuota, PAGO_EN, VALOR_UNITARIO, 
        Mes, ORIGINALES, TEORICA, PRIMER_VENCIMIENTO, VENCIMIENTO,ESTADO,CAPITAL,CONCAT(CTE,'-',FICHA) as CODIGO  
        FROM BaseDetalle WHERE CTE in (?) 
        ${filterDevEasyCash ? " AND (ESTADO != 'DEVOLUCION' OR FICHA <= 50000) " : ""} 
        ${Easy ? "AND FICHA > 50000" : ""} order by ${orderBy} ${order}`, [CTE]);



    return res;
}

const getPagosAcumulados = async ({ CTE, Easy = false }) => {

    const [pagos] = await pool.query(`
    SELECT pm.CTE,pm.FICHA,pm.VALOR,pm.FECHA,SERV,MORA,
    coalesce(bd.CUOTA,f.CUOTA) as CUOTA,
    COALESCE(bd.PRIMER_VENCIMIENTO,f.PRIMER_PAGO) as PRIMER_VENCIMIENTO,
    COALESCE(bd.VENCIMIENTO,f.VENCIMIENTO) as VENCIMIENTO,
    COALESCE(bd.ORIGINALES,f.TOTAL / f.CUOTA) as ORIGINALES,
    CONCAT(pm.CTE,'-',pm.FICHA) AS CODIGO
    
    FROM PagosSVAcumulado pm LEFT JOIN BaseDetalle bd on pm.CTE = bd.CTE and pm.FICHA = bd.FICHA left join Fichas f on f.CTE = pm.CTE and f.FICHA = pm.FICHA WHERE pm.CTE IN (?) ${Easy ? " AND pm.FICHA > 50000" : ''} AND (bd.ESTADO = "ACTIVO" or bd.ESTADO is null) order by CODIGO,pm.FECHA;
    `, [CTE])

    return pagos
}

const getCliente = async ({ CTE }) => {
    const [CTE_DATA] = await pool.query(`
    SELECT CTE, NOMBRE, ZONA, CALLE, CRUCES, CRUCES2, DNI, GARANTE_CTE, 
    DOMICILIO_LABORAL, EXCEPCION_DNI, ES_CLAVO, OBS FROM ClientesSV WHERE CTE in (?)
    `, [CTE])
    return CTE_DATA
}




module.exports = { getBaseDetalle, getPagosAcumulados, getCliente }