const pool = require("../../model/connection-database")

const getPagosMP = async () => {
    try {
        const [pagos] = await pool.query(
`SELECT
    CTE,
    FICHA,
    MP_OPERACION,
    VALOR,
    SERV,
    MORA,
    MP,
    MP_TITULAR,
    COBRADOR
FROM
    PagosSV
WHERE
    CONFIRMACION != 'INVALIDO' AND MP_TITULAR IS NOT NULL AND MP_TITULAR != '' AND MP_OPERACION IS NOT NULL AND MP_OPERACION != ''
ORDER BY
    PagosSV.MP_OPERACION ASC`);

    return pagos;


    } catch (error) {
        console.log("error al consultar los pagos", error);
    }

}

const getPagoByCodigo = async (CODIGO) => {
    const [ficha_data] = await pool.query(
        "SELECT * FROM `PagosSV` WHERE CODIGO = ?;"
        , [CODIGO]);

    if (ficha_data.length > 0) {
        return ficha_data[0];
    }
    return [];
}



const cargarPago = async ({
    CTE, FICHA, CUOTA, PROXIMO, SERV = 0, MORA = 0,
    CONFIRMACION = "PENDIENTE", USUARIO, FECHA, CODIGO, OBS, MP_PORCENTAJE = 0, N_OPERACION, MP_TITULAR, DECLARADO_COB = 0, DECLARADO_CUO = 0, ID_VENTA = null
}) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [ficha_data] = await connection.query(
            `INSERT INTO PagosSV (CTE, FICHA, VALOR, PROXIMO, MP, SERV, MORA, COBRADOR, FECHA, CONFIRMACION,CODIGO,OBS,MP_OPERACION,MP_TITULAR,DECLARADO_COB,DECLARADO_CUO,ID_VENTA) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? where not EXISTS (SELECT true from PagosSV where ID_VENTA = ?)`
            , [CTE, FICHA, CUOTA, PROXIMO, MP_PORCENTAJE, SERV, MORA, USUARIO, FECHA, CONFIRMACION, CODIGO, OBS, N_OPERACION, MP_TITULAR, DECLARADO_COB, DECLARADO_CUO, ID_VENTA, ID_VENTA]);

        if (PROXIMO)
            await connection.query(`INSERT INTO CambiosDeFecha (FICHA, CAMBIO, COBRADOR, FECHA, CODIGO_PAGO,CAMBIO_ORIGINAL) VALUES (?)`, [[FICHA, PROXIMO, USUARIO, FECHA, CODIGO,PROXIMO]])


        await connection.query(
            `INSERT INTO PlanillasDeCobranza 
                (FECHA,COB, EDITABLE,EFECTIVO, RECEPCION) SELECT 
                ? where not EXISTS (SELECT true from PlanillasDeCobranza where FECHA = ? and COB = ?);`
            , [[FECHA, USUARIO, 1, 0, null], FECHA, USUARIO]);

        await connection.commit();
        return ficha_data;

    } catch (error) {
        console.error(error);
        await connection.rollback();
    } finally {
        connection.release();
    }
    return [];

}

const getFichasByCte = async (CTE = "%", MODO = "CTE") => {
    const [fichas] = await pool.query(
        `SELECT
            Fichas.FECHA AS FECHA_VENTA,
            Fichas.CTE,
            Fichas.PRIMER_PAGO,
            Fichas.FICHA,
            Fichas.Z,
            Fichas.VENCIMIENTO,
            Fichas.TOTAL,
            Fichas.SERVICIO_ANT,
            Fichas.ARTICULOS,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.SERV,0)),
                0),
                INTEGER
            ) AS SERV_PAGO,
            SERV_UNIT,
            CUOTA,
            CUOTA_ANT,
            Fichas.CUOTA_ANT - CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.VALOR,0)),
                0),
                INTEGER
            ) AS SALDO,
            CONVERT(
                Fichas.TOTAL / Fichas.CUOTA,
                INTEGER
            ) AS CUOTAS,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.VALOR,0)),
                0),
                INTEGER
            ) AS CUOTA_PAGO,
            Fichas.MORA_ANT,
            CONVERT(
                IFNULL(SUM(IF(PagosSV.CONFIRMACION != 'INVALIDO',PagosSV.MORA,0)),
                0),
                INTEGER
            ) AS MORA_PAGO
        FROM
            Fichas
        LEFT JOIN PagosSV ON PagosSV.FICHA = Fichas.FICHA
        
        WHERE
            Fichas.?? LIKE ? 
        GROUP BY
            Fichas.FICHA;`
        // HAVING
        //     SALDO > 0;
        , [MODO, CTE]);

    if (fichas.length > 0) {
        return fichas;
    }

    return [];
}
const getPrestamosByCte = async (CTE, MODO = "CTE") => {
    const query = "SELECT `FECHA`, `CTE`, `Prestamo`, `Zona`, `Valor`, `Capital`, `Ant`, `Mes 0`, `Mes 1`, `Mes 2`, `Mes 3`, `Mes 4`, `Mes 5`, `Saldo Ant`, `Mes 6`, `Saldo Act`, CONVERT(`Cuota`,INTEGER) as `CUOTA`, `Cuo`, `Estatus`, `V`, `Fecha cobro`, `C De Fecha`, `Prox Fecha`, `SERVICIOS ANT`, `SERVICIOS PAGO`, CONVERT(`SERVICIOS`,INTEGER) AS `SERVICIOS`, CONVERT(`MORA`,INTEGER) AS `MORA`, `MORA UNIT`, `Vencidas`, CONVERT(`Deuda Cuo`,INTEGER) AS `DEUDA_CUO` FROM `CobranzasEC` WHERE ?? = ?  UNION SELECT `FECHA`, `CTE`, `Prestamo`, `Zona`, `Valor`, `Capital`, `Ant`, `Mes 0`, `Mes 1`, `Mes 2`, `Mes 3`, `Mes 4`, `Mes 5`, `Saldo Ant`, `Mes 6`, `Saldo Act`, CONVERT(`Cuota`,INTEGER) as `CUOTA`, `Cuo`, `Entregado`, `V`, `Fecha cobro`, `C De Fecha`, `Prox Fecha`, `SERVICIOS ANT`,`SERVICIOS PAGO`,`SERVICIOS`,  `MORA`, `MORA UNIT`, `Vencidas`, `Deuda Cuo` FROM `VentasEC` WHERE ?? = ?;"

    const [prestamos] = await pool.query(
        query, [MODO, CTE, MODO, CTE]
    );

    return prestamos
}

const insertCambioDeFecha = async ({ CTE, FICHA, FECHA_COB, COBRADOR, FECHA }) => {
    const [response] = await pool.query(
        "INSERT INTO `PagosSV` (`CTE`, `FICHA`, `PROXIMO`, `COBRADOR`, `FECHA`) " +
        "VALUES " +
        "(?,?,?,?,?)", [CTE, FICHA, FECHA_COB, COBRADOR, FECHA])

    return response;
}
const getAcumuladoByCteFicha = async ({ CTE, FICHA }) => {

    const [pago_data] = await pool.query(
        `SELECT
        MES_ANIO,
        MES,
        CONVERT(SUM(CUOTA),
        INTEGER) AS CUOTA,
        CONVERT(SUM(t.MORA),
        INTEGER) AS MORA,
        CONVERT(SUM(t.SERV),
        INTEGER) AS SERV
    FROM
        (
        SELECT
            CONCAT(YEAR(PagosSVAcumulado.FECHA) ,'-', MONTH(PagosSVAcumulado.FECHA)) AS MES_ANIO,
            MONTH(PagosSVAcumulado.FECHA) AS MES,
            SUM(VALOR) AS CUOTA,
            CONVERT(IFNULL(SUM(MORA),
            0),
            INTEGER) AS MORA,
            CONVERT(IFNULL(SUM(SERV),
            0),
            INTEGER) AS SERV
        FROM
            PagosSVAcumulado
        WHERE
            CONCAT(CTE, '-', FICHA) = CONCAT(?, '-', ?) AND PagosSVAcumulado.CONFIRMACION != 'INVALIDO'
        GROUP BY
            MES
        UNION
    SELECT
        CONCAT(YEAR(CURRENT_DATE) ,'-',MONTH(CURRENT_DATE))AS MES_ANIO,
        MONTH(CURRENT_DATE) AS MES,
        SUM(PagosSV.VALOR) AS CUOTA,
        CONVERT(
            IFNULL(SUM(PagosSV.MORA),
            0),
            INTEGER
        ) AS MORA,
        CONVERT(
            IFNULL(SUM(PagosSV.SERV),
            0),
            INTEGER
        ) AS SERV
    FROM
        PagosSV
    WHERE
        CONCAT(PagosSV.CTE, '-', PagosSV.FICHA) = CONCAT(?, '-', ?) AND PagosSV.CONFIRMACION != 'INVALIDO'
    GROUP BY
        MES
    ) t
    GROUP BY
        t.MES;`
        , [CTE, FICHA, CTE, FICHA])

    if (pago_data.length > 0) {
        return pago_data;
    }

    return [];

}



const getFechasDePagosYCobradores = async () => {

    const [FECHAS] = await pool.query(
        "SELECT DISTINCT COBRADOR,FECHA FROM `PagosSV` WHERE CONFIRMACION != 'INVALIDO' ORDER BY `PagosSV`.`FECHA` DESC;");


    if (FECHAS.length > 0) {
        return FECHAS;
    }

    return [];

}

const getPagosByFechaYCob = async ({ COB = "%", FECHA = "%", ORDEN }) => {

    const [PAGOS] = await pool.query(
        `SELECT
        PagosSV.CTE,
        PagosSV.FICHA,
        ClientesSV.ZONA AS Z,
        VALOR AS CUOTA,
        DAY(Fichas.VENCIMIENTO) AS DIA_VENCIMIENTO,
        PROXIMO,
        PagosSV.OBS,
        MP,
        SERV,
        MORA,
        COBRADOR,
        PagosSV.FECHA,
        PagosSV.MP_TITULAR,
        CONFIRMACION,
        CODIGO,
        PagosSV.ID,
        Fichas.CUOTA_ANT -(
        SELECT
            SUM(PagosSV.VALOR)
        FROM
            PagosSV
        WHERE
            PagosSV.FICHA = Fichas.FICHA AND PagosSV.CONFIRMACION != 'INVALIDO'
    ) AS SALDO,
    PagosSV.DECLARADO_CUO,
    PagosSV.DECLARADO_COB,
    PagosSV.SERV + PagosSV.MORA AS CUOTA_SERV,
    ClientesSV.CALLE,
    ClientesSV.NOMBRE AS NOMBRE
    FROM
        PagosSV
    LEFT JOIN Fichas ON Fichas.FICHA = PagosSV.FICHA
    LEFT JOIN ClientesSV ON ClientesSV.CTE = PagosSV.CTE
    WHERE
        PagosSV.FECHA LIKE ? AND PagosSV.COBRADOR LIKE ? AND PagosSV.CONFIRMACION != 'INVALIDO'
    GROUP BY
        CODIGO
    ORDER BY
        CONFIRMACION,
        ??,
        PagosSV.FICHA`
        , [FECHA, COB, ORDEN]);

    if (PAGOS.length > 0) {
        return PAGOS;
    }
    return [];
}

const updateDistribucionByCodigo = async ({ PROXIMO, SERV, MORA, CUOTA, CODIGO }) => {
    const connection = await pool.getConnection();
    console.log({ PROXIMO, SERV, MORA, CUOTA, CODIGO });
    try {
        await connection.beginTransaction();
        const [update_result] = await connection.query(
            "UPDATE PagosSV SET PROXIMO = ?, SERV = ? , MORA = ?, VALOR = ? WHERE CODIGO = ? ", [PROXIMO, SERV, MORA, CUOTA, CODIGO]);
        

            await connection.query(`UPDATE CambiosDeFecha SET CAMBIO = ? WHERE CODIGO_PAGO = ?`, [PROXIMO, CODIGO]);

            await connection.commit();
        if (update_result.length > 0) {
            return update_result;
        }
        return [];

    } catch (error) {
        connection.rollback();
        console.log("error al redistirbuir pago");
        console.log(error);
    } finally{
        connection.release()
    }
}
const updateEstadoPagoByCodigo = async ({ newState, filter }) => {

    try {

        const [update_result] = await pool.query
            (`UPDATE PagosSV SET ? WHERE ? `, [newState, filter]);

        if (update_result.length > 0) {
            return update_result;
        }


    } catch (error) {
        console.log("error al editar pago");
        console.log("new state", newState);
        console.log("filter", filter);
    }
    return [];
}
const invalidarPago = async ({ CODIGO }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(`UPDATE PagosSV set CONFIRMACION = 'INVALIDO' WHERE CODIGO = ?`, [CODIGO]);
        await connection.query(`DELETE FROM CambiosDeFecha WHERE CODIGO_PAGO = ?`, [CODIGO]);

        await connection.commit()
    } catch (error) {

        await connection.rollback();
    } finally {
        connection.release();
    }
}


const updateMoraYServicioAntBase = async () => {
    const [update_result] = await pool.query(
        "UPDATE PagosSV SET CONFIRMACION = ? WHERE CODIGO = ? ", [ESTADO, CODIGO]);

    if (update_result.length > 0) {
        return update_result;
    }
    return [];
}

//Recibe un array de numeros de fichas
const updateSaldosAnterioresYServicios = async (FICHAS) => {
    try {
        const [update_result] = await pool.query(
            `UPDATE
                Fichas
            LEFT JOIN(
                SELECT
                    PagosSV.FICHA AS ficha_sub_consulta,
                    IFNULL(SUM(PagosSV.SERV),
                    0) AS suma_valores,
                    IFNULL(SUM(PagosSV.MORA),
                    0) AS suma_mora
                FROM
                    PagosSV
                WHERE
                    PagosSV.CONFIRMACION != 'INVALIDO'
                GROUP BY
                    PagosSV.FICHA
            ) AS subconsulta
            ON
                Fichas.FICHA = subconsulta.ficha_sub_consulta
            SET
                Fichas.SERVICIO_ANT = subconsulta.suma_valores,
                Fichas.MORA_ANT = subconsulta.suma_mora
            WHERE
                Fichas.FICHA IN(?)`, [FICHAS]);
        return update_result;

    } catch (err) {
        console.error("ERROR AL CARGAR SALDOS ANTERIORES", err);
    }
}





module.exports = { cargarPago, getAcumuladoByCteFicha, getFechasDePagosYCobradores, getFichasByCte, getPagoByCodigo, getPagosByFechaYCob, getPrestamosByCte, insertCambioDeFecha, updateDistribucionByCodigo, updateEstadoPagoByCodigo, updateMoraYServicioAntBase, updateSaldosAnterioresYServicios, invalidarPago, getPagosMP }