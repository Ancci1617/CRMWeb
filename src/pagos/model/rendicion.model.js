const pool = require("../../model/connection-database.js");

module.exports = {

    getRendicion: async function ({ FECHA, COB }) {
        try {

            const [rendicion] = await pool.query(
            `SELECT
            Pl.ID,
            COB,
            Pl.FECHA,
            EFECTIVO,
            RECEPCION,
            EDITABLE,
            IFNULL(calc_pagos.TOTAL_COBRADO, 0) AS TOTAL_COBRADO,
            IFNULL(calc_pagos.MP, 0) AS MP,
            IFNULL(calc_ventas.CONTADO, 0) AS CONTADO,
            IFNULL(calc_gastos.TOTAL_GASTOS, 0) AS TOTAL_GASTOS,
            IFNULL(calc_pagos.TOTAL_COBRADO, 0) - IFNULL(calc_pagos.MP, 0) - IFNULL(calc_gastos.TOTAL_GASTOS, 0) + IFNULL(calc_ventas.CONTADO, 0) - EFECTIVO AS DIFERENCIA
        FROM
            PlanillasDeCobranza Pl
        LEFT JOIN(
            SELECT
                SUM(Pa.VALOR + Pa.MORA + Pa.SERV) AS TOTAL_COBRADO,
                SUM(
                    IF(
                        Pa.MP_OPERACION IS NOT NULL AND Pa.MP_OPERACION > 0 AND Pa.MP_OPERACION != '',
                        Pa.SERV + Pa.MORA + Pa.VALOR,
                        0
                    )
                ) AS MP,
                Pa.FECHA,
                Pa.COBRADOR
            FROM
                PagosSV Pa
            WHERE
                Pa.CONFIRMACION != 'INVALIDO' 
            GROUP BY
                Pa.FECHA,
                Pa.COBRADOR
        ) AS calc_pagos
        ON
            calc_pagos.FECHA = Pl.FECHA AND calc_pagos.COBRADOR = Pl.COB
        LEFT JOIN(
            SELECT
                SUM(Vc.TOTAL) AS CONTADO,
                Vc.USUARIO,
                Vc.FECHA_VENTA
            FROM
                VentasCargadas Vc
            WHERE
                Vc.MODO = 'CONTADO' AND Vc.VISIBLE = 1 AND Vc.TIPO = 'EFECTIVO'
            GROUP BY
                Vc.USUARIO,
                Vc.FECHA_VENTA
        ) AS calc_ventas
        ON
            calc_ventas.FECHA_VENTA = Pl.FECHA AND calc_ventas.USUARIO = Pl.COB
        LEFT JOIN(
            SELECT
                SUM(G.MONTO) AS TOTAL_GASTOS,
                G.ID_RENDICION
            FROM
                Gastos G
            GROUP BY
                G.ID_RENDICION
        ) AS calc_gastos
        ON
            calc_gastos.ID_RENDICION = Pl.ID
        WHERE
            Pl.FECHA = ? AND Pl.COB = ?;`, [FECHA, COB]);
            return rendicion[0];

        } catch (error) {
            console.error("No se pudo consultar la rendicion ", error);
        }

    }









}


