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
                SUM(Pa.VALOR + Pa.MORA + Pa.SERV) AS TOTAL_COBRADO,
                SUM(
                    CASE WHEN Pa.MP_OPERACION IS NOT NULL > 0 AND Pa.MP_OPERACION != '' THEN Pa.SERV + Pa.MORA + Pa.VALOR ELSE 0
                END
            ) AS MP,
            (
                SELECT
                    SUM(VentasCargadas.TOTAL)
                FROM
                    VentasCargadas
                WHERE
                    VentasCargadas.USUARIO = Pl.COB AND FECHA_VENTA = Pl.FECHA AND MODO = 'CONTADO' AND VISIBLE = 1 AND TIPO = 'EFECTIVO'
            ) AS CONTADO,
            IFNULL(
                (
                SELECT
                    SUM(MONTO)
                FROM
                    Gastos
                WHERE
                    ID_RENDICION = Pl.ID
            ),
            0
            ) AS TOTAL_GASTOS,
            SUM(Pa.VALOR + Pa.MORA + Pa.SERV) - SUM(
                CASE WHEN Pa.MP_OPERACION IS NOT NULL > 0 AND Pa.MP_OPERACION != '' THEN Pa.SERV + Pa.MORA + Pa.VALOR ELSE 0
            END
            ) - IFNULL(
                (
                SELECT
                    SUM(MONTO)
                FROM
                    Gastos
                WHERE
                    ID_RENDICION = Pl.ID
            ),
            0
            ) + IFNULL(
                (
                SELECT
                    SUM(VentasCargadas.TOTAL)
                FROM
                    VentasCargadas
                WHERE
                    VentasCargadas.USUARIO = Pl.COB AND FECHA_VENTA = Pl.FECHA AND MODO = 'CONTADO' AND VISIBLE = 1 AND TIPO = 'EFECTIVO'
            ),
            0
            ) - EFECTIVO AS DIFERENCIA
            FROM
                PlanillasDeCobranza Pl
            LEFT JOIN PagosSV Pa ON
                Pa.FECHA = Pl.FECHA AND Pa.COBRADOR = Pl.COB
            WHERE
                Pa.CONFIRMACION != 'INVALIDO' AND 
                Pl.FECHA = ? AND Pl.COB = ?;`, [FECHA, COB]);
            return rendicion[0];

        } catch (error) {
            console.error("No se pudo consultar la rendicion ", error);
        }

    }









}


