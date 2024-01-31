const pool = require("../../model/connection-database.js");

const getMasterSummaryBefore2023 = async ({ cteList }) => {

    const [summary] = await pool.query(
        `SELECT AVG(TEORICA) as PROMEDIO,MIN(TEORICA) as MINIMO,MAX(TEORICA) as MAXIMO FROM basedetalle where CTE in (?) and FECHA < '2022-12-01';`,
        [cteList]
    )

    return summary

}

const getPagosAcumulados = async ({ CTE }) => {
    const [pagos] = await pool.query(`
    SELECT pm.CTE,pm.FICHA,VALOR,pm.FECHA,SERV,MORA,bd.FECHA,
    bd.Cuota,bd.PRIMER_VENCIMIENTO,bd.VENCIMIENTO,bd.ORIGINALES   
    FROM pagossvmaster pm LEFT JOIN basedetalle bd on pm.CTE = bd.CTE and pm.FICHA = bd.FICHA WHERE pm.CTE = ?,;`,
    [CTE]
    )
    return pagos
}

module.exports = { getMasterSummaryBefore2023 ,getPagosAcumulados}

