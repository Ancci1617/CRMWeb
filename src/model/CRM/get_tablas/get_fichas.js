

const pool = require("../../connection-database.js");

const getFichas = async (cte) => {

    const [rows] = await pool.query(

        `SELECT
        DATE_FORMAT(Fichas.FECHA, '%d/%m/%y') AS FECHA_FORMAT,
        Fichas.FECHA as FECHA,
        Fichas.CTE,
        CONVERT(Fichas.FICHA,INTEGER) as FICHA,
        Fichas.Z,
        Fichas.TOTAL,
        acumulados.ANT,
        IFNULL(acumulados.MES0, IF(Fichas.FECHA <= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH),0,null) ) as MES0,
        IFNULL(acumulados.MES1, IF(Fichas.FECHA <= DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH),0,null) ) as MES1,
        IFNULL(acumulados.MES2, IF(Fichas.FECHA <= DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH),0,null) ) as MES2,
		IFNULL(acumulados.MES3, IF(Fichas.FECHA <= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH),0,null) ) as MES3,
		IFNULL(acumulados.MES4, IF(Fichas.FECHA <= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH),0,null) ) as MES4,
		IFNULL(acumulados.MES5, IF(Fichas.FECHA <= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH),0,null) ) as MES5,
        Fichas.CUOTA_ANT,
        CONVERT(IFNULL(pagos.CUOTA_PAGO, 0),INTEGER) AS CUOTA_PAGO,
        Fichas.CUOTA_ANT - CONVERT(IFNULL(pagos.CUOTA_PAGO,0),INTEGER) AS SALDO,
        Fichas.CUOTA,
        CONVERT(
            Fichas.TOTAL / Fichas.CUOTA,
            INTEGER
        ) AS CUOTAS,

        Fichas.ESTADO,
        ROUND(
            (Fichas.CUOTA_ANT - CONVERT(IFNULL(pagos.CUOTA_PAGO,0),INTEGER)) /(
            SELECT
                LP.\`CUOTAS 6\`
            FROM
                LP
            WHERE
                LP.Art = '36'
            LIMIT 1
        ),
        1
        ) AS VU,
        Fichas.VENCIMIENTO,Fichas.PRIMER_PAGO,(
            SELECT
                CambiosDeFecha.CAMBIO
            FROM
                CambiosDeFecha
            WHERE
                CambiosDeFecha.FICHA = Fichas.FICHA
            ORDER BY
                CambiosDeFecha.ID
            DESC
        LIMIT 1
        ) AS CDeFecha,

        Fichas.SERVICIO_ANT,
        CONVERT(IFNULL(pagos.SERV_PAGO,0),INTEGER) as SERV_PAGO,
        Fichas.SERV_UNIT,

        Fichas.MORA_ANT,
        CONVERT(IFNULL(pagos.MORA_PAGO,0),INTEGER) as MORA_PAGO
        


    FROM
        Fichas
    LEFT JOIN(
        SELECT
            PagosSVAcumulado.FICHA,
            PagosSVAcumulado.CTE,
            SUM(
                IF(
                    PagosSVAcumulado.FECHA < DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH) OR PagosSVAcumulado.FECHA = 'ANT',
                    PagosSVAcumulado.VALOR,
                    0
                )
            ) AS ANT,
            SUM(
                IF(
                    MONTH(PagosSVAcumulado.FECHA) = MONTH(
                        DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
                    ) AND YEAR(PagosSVAcumulado.FECHA) = YEAR(
                        DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
                    ),
                    PagosSVAcumulado.VALOR,
                    null
                )
            ) AS MES5,
            SUM(
                IF(
                    MONTH(PagosSVAcumulado.FECHA) = MONTH(
                        DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)
                    ) AND YEAR(PagosSVAcumulado.FECHA) = YEAR(
                        DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)
                    ),
                    PagosSVAcumulado.VALOR,
                    null
                )
            ) AS MES4,
            SUM(
                IF(
                    MONTH(PagosSVAcumulado.FECHA) = MONTH(
                        DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
                    ) AND YEAR(PagosSVAcumulado.FECHA) = YEAR(
                        DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
                    ),
                    PagosSVAcumulado.VALOR,
                    null
                )
            ) AS MES3,
            SUM(
                IF(
                    MONTH(PagosSVAcumulado.FECHA) = MONTH(
                        DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)
                    ) AND YEAR(PagosSVAcumulado.FECHA) = YEAR(
                        DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)
                    ),
                    PagosSVAcumulado.VALOR,
                    null
                )
            ) AS MES2,
            SUM(
                IF(
                    MONTH(PagosSVAcumulado.FECHA) = MONTH(
                        DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)
                    ) AND YEAR(PagosSVAcumulado.FECHA) = YEAR(
                        DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)
                    ),
                    PagosSVAcumulado.VALOR,
                    null
                )
            ) AS MES1,
            SUM(
                IF(
                    MONTH(PagosSVAcumulado.FECHA) = MONTH(
                        DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
                    ) AND YEAR(PagosSVAcumulado.FECHA) = YEAR(
                        DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
                    ),
                    PagosSVAcumulado.VALOR,
                    null
                )
            ) AS MES0
        FROM
            PagosSVAcumulado
        GROUP BY
            FICHA
    ) acumulados
    ON
        CONCAT(acumulados.FICHA,'-',acumulados.CTE) = CONCAT(Fichas.FICHA,'-',Fichas.CTE) 
    LEFT JOIN(
        SELECT
            PagosSV.CTE,
            PagosSV.FICHA,
            IFNULL(SUM(PagosSV.VALOR),
            0) AS CUOTA_PAGO,

            SUM(PagosSV.SERV) as SERV_PAGO,
            IFNULL(SUM(PagosSV.MORA),0) as MORA_PAGO
            FROM
            PagosSV
        WHERE
            PagosSV.CONFIRMACION != 'INVALIDO'
        GROUP BY
            FICHA
    ) pagos
    ON
        pagos.FICHA = Fichas.FICHA AND pagos.CTE = Fichas.CTE
    WHERE
        Fichas.CTE like ?
    GROUP BY
        Fichas.FICHA;;`, [cte]);


    if (rows.length > 0) {
        return rows;
    }

    return [];

}

module.exports = { getFichas };




