const pool = require("../../model/connection-database.js");

const getMasterSummaryBefore2023 = async ({ cteList }) => {

    const [summary] = await pool.query(
        `SELECT AVG(TEORICA) as PROMEDIO,MIN(TEORICA) as MINIMO,MAX(TEORICA) as MAXIMO FROM basedetalle where CTE in (?) and FECHA < '2022-12-01';`,
        [cteList]
    )

    return summary

}

const getMasterSummary = async ({cteList}) => {
    const [summary] = await pool.query(
        `SELECT CTE,COUNT(*) AS CantCreditos from BaseDetalle where CTE in (?) group by CTE`,[cteList]
    )
    return summary
}


module.exports = { getMasterSummaryBefore2023,getMasterSummary}

