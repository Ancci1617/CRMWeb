

const pool = require("../../connection-database.js");

const getFichas = async (campo, condicion, criterio = "like", criterio2 = "TRUE") => {
    const [rows] = await pool.query(

        `WITH acumulados as (
            SELECT
                PagosSVAcumulado.FICHA,
                PagosSVAcumulado.CTE,
                SUM(
                    CASE
                        WHEN PagosSVAcumulado.FECHA <= DATE_SUB(LAST_DAY(CURRENT_DATE), INTERVAL 7 MONTH) 
                        OR PagosSVAcumulado.FECHA = 'ANT' THEN 
                        PagosSVAcumulado.VALOR
                        ELSE 0
                    END
                ) AS ANT,
                SUM(
                    CASE 
                        WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) AND
                        MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) THEN VALOR
                        ELSE NULL
                    END
                ) AS MES5,
                SUM(
                    CASE 
                        WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)) AND
                        MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)) THEN VALOR
                        ELSE NULL
                    END
                ) AS MES4,
                SUM(
                    CASE 
                        WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)) AND
                        MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)) THEN VALOR
                        ELSE NULL
                    END
                ) AS MES3,
                SUM(
                    CASE 
                        WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)) AND
                        MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)) THEN VALOR
                        ELSE NULL
                    END
                ) AS MES2,
                SUM(
                    CASE 
                        WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)) AND
                        MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)) THEN VALOR
                        ELSE NULL
                    END
                ) AS MES1,
                SUM(
                    CASE 
                        WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)) AND
                        MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)) THEN VALOR
                        ELSE NULL
                    END
                ) AS MES0
            FROM
                PagosSVAcumulado
            GROUP BY
                CTE,FICHA
        ),
        
        pagos AS (
            SELECT
                PagosSV.CTE,
                PagosSV.FICHA,
                COALESCE(SUM(PagosSV.VALOR), 0) AS CUOTA_PAGO,
                COALESCE(SUM(PagosSV.SERV), 0) as SERV_PAGO,
                COALESCE(SUM(PagosSV.MORA), 0) as MORA_PAGO
            FROM
                PagosSV
            WHERE
                PagosSV.CONFIRMACION != 'INVALIDO'
            GROUP BY
                FICHA
        )
        SELECT
            DATE_FORMAT(Fichas.FECHA, '%d/%m/%y') AS FECHA_FORMAT,
            Fichas.FECHA as FECHA,
            Fichas.CTE,
            Fichas.ARTICULOS,
            CONVERT(Fichas.FICHA, INTEGER) as FICHA,
            Fichas.Z,
            Fichas.ANTICIPO,
            Fichas.TOTAL,
            acumulados.ANT,
            IFNULL(
                acumulados.MES0,
                IF(
                    Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)),
                    0,
                    null
                )
            ) as MES0,
            IFNULL(
                acumulados.MES1,
                IF(
                    Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)),
                    0,
                    null
                )
            ) as MES1,
            IFNULL(
                acumulados.MES2,
                IF(
                    Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)),
                    0,
                    null
                )
            ) as MES2,
            IFNULL(
                acumulados.MES3,
                IF(
                    Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)),
                    0,
                    null
                )
            ) as MES3,
            IFNULL(
                acumulados.MES4,
                IF(
                    Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)),
                    0,
                    null
                )
            ) as MES4,
            IFNULL(
                acumulados.MES5,
                IF(
                    Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)),
                    0,
                    null
                )
            ) as MES5,
            Fichas.CUOTA_ANT,
            CONVERT(IFNULL(pagos.CUOTA_PAGO, 0), INTEGER) AS CUOTA_PAGO,
            Fichas.CUOTA_ANT - CONVERT(IFNULL(pagos.CUOTA_PAGO, 0), INTEGER) AS SALDO,
            Fichas.CUOTA,
            CONVERT(
                Fichas.TOTAL / Fichas.CUOTA,
                INTEGER
            ) AS CUOTAS,
            Fichas.ESTADO,
            CONVERT(
                ROUND(
                    (
                        Fichas.CUOTA_ANT - CONVERT(IFNULL(pagos.CUOTA_PAGO, 0), INTEGER)
                    ) / (
                        SELECT
                            VU
                        FROM
                            ValoresUnitarios
                        WHERE
                            MES = DATE_ADD(LAST_DAY(DATE_SUB(Fichas.FECHA,INTERVAL 1 MONTH)),INTERVAL 1 DAY)
                        LIMIT
                            1
                    ), 1
                ), FLOAT
            ) AS VU,
            Fichas.VENCIMIENTO,
            Fichas.PRIMER_PAGO,
            (
                SELECT
                    CambiosDeFecha.CAMBIO
                FROM
                    CambiosDeFecha
                WHERE
                    CambiosDeFecha.FICHA = Fichas.FICHA
                ORDER BY
                    CambiosDeFecha.ID DESC
                LIMIT
                    1
            ) AS CDeFecha,
            Fichas.SERVICIO_ANT,
            CONVERT(IFNULL(pagos.SERV_PAGO, 0), INTEGER) as SERV_PAGO,
            Fichas.SERV_UNIT,
            Fichas.MORA_ANT,
            CONVERT(IFNULL(pagos.MORA_PAGO, 0), INTEGER) as MORA_PAGO,
            Vencidas(
                VencimientoEvaluado(
                    Fichas.VENCIMIENTO,
                    Fichas.PRIMER_PAGO,
                    CURRENT_DATE
                ),
                CURRENT_DATE,
                Fichas.TOTAL / Fichas.CUOTA
            ) as VENCIDAS,
            CONVERT(
                ROUND(
                    (
                        Fichas.TOTAL - Fichas.CUOTA_ANT + IFNULL(pagos.CUOTA_PAGO, 0)
                    ) / Fichas.CUOTA,
                    1
                ),
                FLOAT
            ) as Pagas,
            ROUND(
                Vencidas(
                    VencimientoEvaluado(
                        Fichas.VENCIMIENTO,
                        Fichas.PRIMER_PAGO,
                        CURRENT_DATE
                    ),
                    CURRENT_DATE,
                    Fichas.TOTAL / Fichas.CUOTA
                ) - (
                    Fichas.TOTAL - Fichas.CUOTA_ANT + IFNULL(pagos.CUOTA_PAGO, 0)
                ) / Fichas.CUOTA,
                1
            ) AS Atraso,
            Vencidas(
                VencimientoEvaluado(
                    Fichas.VENCIMIENTO,
                    Fichas.PRIMER_PAGO,
                    CURRENT_DATE
                ),
                CURRENT_DATE,
                Fichas.TOTAL / Fichas.CUOTA
            ) - FLOOR(
                (
                    Fichas.TOTAL - Fichas.CUOTA_ANT + IFNULL(pagos.CUOTA_PAGO, 0)
                ) / Fichas.CUOTA + 0.3
            ) as Atraso_evaluado,
            LEAST(
                (
                    SELECT
                        COUNT(*)
                    FROM
                        CambiosDeFecha
                    WHERE
                        CambiosDeFecha.FECHA > DATE_ADD(
                            Fichas.VENCIMIENTO,
                            INTERVAL Pagas(
                                IFNULL(CUOTA_PAGO, 0) + TOTAL - CUOTA_ANT,
                                CUOTA,
                                1
                            ) MONTH
                        )
                        AND CambiosDeFecha.FICHA = Fichas.FICHA
                        AND OFICINA = 0
                ),
                5
            ) AS CAMBIOS_DE_FECHA_EXACTO
                    FROM
            Fichas
            LEFT JOIN acumulados ON acumulados.FICHA = Fichas.FICHA
            and acumulados.CTE = Fichas.CTE
            LEFT JOIN pagos ON pagos.FICHA = Fichas.FICHA
            AND pagos.CTE = Fichas.CTE
        
      WHERE
        Fichas.??    ${criterio} ? AND ${criterio2} 
    GROUP BY
        Fichas.FICHA 
    ORDER BY 
        Fichas.FECHA;`, [campo, condicion]);


    if (rows.length > 0) {
        return rows;
    }

    return [];

}

const getFichasOptimized = async ({ withAcumulado = false, withCambiosDeFecha = false, withAtraso = false }, criteriosWhere = [], criteriosHaving = []) => {

    const criterio = criteriosWhere.join(" AND ");
    const criterioHaving = criteriosHaving.join(" AND ");

    const acumuladoStrings = [];
    acumuladoStrings[0] = `acumulados as (
        SELECT
            PagosSVAcumulado.FICHA,
            PagosSVAcumulado.CTE,
            SUM(
                CASE
                    WHEN PagosSVAcumulado.FECHA <= DATE_SUB(LAST_DAY(CURRENT_DATE), INTERVAL 7 MONTH) 
                    OR PagosSVAcumulado.FECHA = 'ANT' THEN 
                    PagosSVAcumulado.VALOR
                    ELSE 0
                END
            ) AS ANT,
            SUM(
                CASE 
                    WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) AND
                    MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) THEN VALOR
                    ELSE NULL
                END
            ) AS MES5,
            SUM(
                CASE 
                    WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)) AND
                    MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)) THEN VALOR
                    ELSE NULL
                END
            ) AS MES4,
            SUM(
                CASE 
                    WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)) AND
                    MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)) THEN VALOR
                    ELSE NULL
                END
            ) AS MES3,
            SUM(
                CASE 
                    WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)) AND
                    MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)) THEN VALOR
                    ELSE NULL
                END
            ) AS MES2,
            SUM(
                CASE 
                    WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)) AND
                    MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)) THEN VALOR
                    ELSE NULL
                END
            ) AS MES1,
            SUM(
                CASE 
                    WHEN YEAR(FECHA) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)) AND
                    MONTH(FECHA) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)) THEN VALOR
                    ELSE NULL
                END
            ) AS MES0
        FROM
            PagosSVAcumulado
        GROUP BY
            CTE,FICHA
    ),`;
    acumuladoStrings[1] = `acumulados.ANT,
    IFNULL(
        acumulados.MES0,
        IF(
            Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)),
            0,
            null
        )
    ) as MES0,
    IFNULL(
        acumulados.MES1,
        IF(
            Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH)),
            0,
            null
        )
    ) as MES1,
    IFNULL(
        acumulados.MES2,
        IF(
            Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH)),
            0,
            null
        )
    ) as MES2,
    IFNULL(
        acumulados.MES3,
        IF(
            Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)),
            0,
            null
        )
    ) as MES3,
    IFNULL(
        acumulados.MES4,
        IF(
            Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)),
            0,
            null
        )
    ) as MES4,
    IFNULL(
        acumulados.MES5,
        IF(
            Fichas.FECHA <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)),
            0,
            null
        )
    ) as MES5,`;
    acumuladoStrings[2] = `LEFT JOIN acumulados ON acumulados.FICHA = Fichas.FICHA and acumulados.CTE = Fichas.CTE`;
    const atrasoString = `ROUND(
        Vencidas(
            VencimientoEvaluado(
                Fichas.VENCIMIENTO,
                Fichas.PRIMER_PAGO,
                CURRENT_DATE
            ),
            CURRENT_DATE,
            Fichas.TOTAL / Fichas.CUOTA
        ) - (
            Fichas.TOTAL - Fichas.CUOTA_ANT + IFNULL(pagos.CUOTA_PAGO, 0)
        ) / Fichas.CUOTA,
        1
    ) AS Atraso,`
    const cambiosDeFechaStrings = [`
        CambiosDeFecha as 
            (
                SELECT *  from CambiosDeFecha INNER JOIN 
                (SELECT FICHA as FICHA_AUX,max(ID) AS ID_AUX
                 from CambiosDeFecha where CAMBIO IS NOT NULL group by FICHA) AUX_ID 
                on AUX_ID.ID_AUX = CambiosDeFecha.ID
             ),    
    `,
        `CambiosDeFecha.CAMBIO as CDeFecha,`,
        `LEFT JOIN CambiosDeFecha on CambiosDeFecha.FICHA = Fichas.FICHA`
    ]


    const [fichas] = await pool.query(`WITH 
    ${withAcumulado ? acumuladoStrings[0] : ""}
    ${withCambiosDeFecha ? cambiosDeFechaStrings[0] : ""}
    pagos AS (
        SELECT
            PagosSV.CTE,
            PagosSV.FICHA,
            COALESCE(SUM(PagosSV.VALOR), 0) AS CUOTA_PAGO,
            COALESCE(SUM(PagosSV.SERV), 0) as SERV_PAGO,
            COALESCE(SUM(PagosSV.MORA), 0) as MORA_PAGO
        FROM
            PagosSV
        WHERE
            PagosSV.CONFIRMACION != 'INVALIDO'
        GROUP BY
            FICHA
    )

    SELECT
        DATE_FORMAT(Fichas.FECHA, '%d/%m/%y') AS FECHA_FORMAT,
        Fichas.FECHA as FECHA,
        Fichas.CTE,
        Fichas.ARTICULOS,
        CONVERT(Fichas.FICHA, INTEGER) as FICHA,
        Fichas.Z,
        Fichas.TOTAL,
        Fichas.ANTICIPO,
        Fichas.ARTICULOS as CAPITAL,

        ${withAcumulado ? acumuladoStrings[1] : ""}
        ${withCambiosDeFecha ? cambiosDeFechaStrings[1] : ""}
        

        Fichas.CUOTA_ANT,
        CONVERT(IFNULL(pagos.CUOTA_PAGO, 0), INTEGER) AS CUOTA_PAGO,
        Fichas.CUOTA_ANT - CONVERT(IFNULL(pagos.CUOTA_PAGO, 0), INTEGER) AS SALDO,
        Fichas.CUOTA,
        CONVERT(
            Fichas.TOTAL / Fichas.CUOTA,
            INTEGER
        ) AS CUOTAS,
        ${withAtraso ? atrasoString : ""}
        Fichas.ESTADO,
        CONVERT(
            ROUND(
                (
                    Fichas.CUOTA_ANT - CONVERT(IFNULL(pagos.CUOTA_PAGO, 0), INTEGER)
                ) / (
                    SELECT
                        VU
                    FROM
                        ValoresUnitarios
                    WHERE
                        MES = DATE_ADD(LAST_DAY(DATE_SUB(Fichas.FECHA,INTERVAL 1 MONTH)),INTERVAL 1 DAY)
                    LIMIT
                        1
                ), 1
            ), FLOAT
        ) AS VU,
        Fichas.VENCIMIENTO,
        Fichas.PRIMER_PAGO,
        Fichas.SERVICIO_ANT,
        CONVERT(IFNULL(pagos.SERV_PAGO, 0), INTEGER) as SERV_PAGO,
        Fichas.SERV_UNIT,
        Fichas.MORA_ANT,
        CONVERT(IFNULL(pagos.MORA_PAGO, 0), INTEGER) as MORA_PAGO
    FROM
        Fichas
        LEFT JOIN pagos ON pagos.FICHA = Fichas.FICHA AND pagos.CTE = Fichas.CTE
        
        ${withAcumulado ? acumuladoStrings[2] : ""}

        ${withCambiosDeFecha ? cambiosDeFechaStrings[2] : ""}
    
    WHERE ${criterio ? criterio : ""} 
GROUP BY
    Fichas.FICHA 

    ${criterioHaving ? "HAVING " + criterioHaving : ""}

ORDER BY 
    Fichas.FECHA;`);
    return fichas;
}

module.exports = { getFichas, getFichasOptimized };




