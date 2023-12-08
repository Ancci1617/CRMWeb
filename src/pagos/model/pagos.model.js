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
            await connection.query(`INSERT INTO CambiosDeFecha (FICHA, CAMBIO, COBRADOR, FECHA, CODIGO_PAGO,CAMBIO_ORIGINAL) VALUES (?)`, [[FICHA, PROXIMO, USUARIO, FECHA, CODIGO, PROXIMO]])


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
    PagosSV.SERV_PAGO,
    SERV_UNIT,
    CUOTA,
    CUOTA_ANT,
    Fichas.CUOTA_ANT - IFNULL(PagosSV.CUOTA_PAGO,0) AS SALDO,
    CUOTAS,
    IFNULL(PagosSV.CUOTA_PAGO,0) AS CUOTA_PAGO,
    Fichas.MORA_ANT,
    IFNULL(PagosSV.MORA_PAGO,0) AS MORA_PAGO,
    Pagas(IFNULL(CUOTA_PAGO,0) + TOTAL - CUOTA_ANT,CUOTA,0) AS CUOTAS_PAGAS,
    
    (SELECT COUNT(*) FROM CambiosDeFecha WHERE
        CambiosDeFecha.FECHA > DATE_ADD(
            Fichas.VENCIMIENTO,
            INTERVAL Pagas(
                IFNULL(CUOTA_PAGO,0) + TOTAL - CUOTA_ANT,
                CUOTA,0
            ) MONTH
        ) AND CambiosDeFecha.FICHA = Fichas.FICHA
	) AS CAMBIOS_DE_FECHA,
    
    LEAST((SELECT COUNT(*) FROM CambiosDeFecha WHERE
        CambiosDeFecha.FECHA > DATE_ADD(
            Fichas.VENCIMIENTO,
            INTERVAL Pagas(
                IFNULL(CUOTA_PAGO,0) + TOTAL - CUOTA_ANT,
                CUOTA,1
            ) MONTH
        ) AND CambiosDeFecha.FICHA = Fichas.FICHA AND OFICINA = 0 
	),5) AS CAMBIOS_DE_FECHA_EXACTO,

    EXISTS (SELECT 1 from CambiosDeFecha where CambiosDeFecha.FECHA = CURRENT_DATE and CambiosDeFecha.FICHA = Fichas.FICHA) as SERVICIO_HOY


FROM

    (SELECT *,ROUND(TOTAL / CUOTA,0) AS CUOTAS FROM Fichas) Fichas
    
LEFT JOIN(
    SELECT
        PagosSV.FICHA,
        SUM(PagosSV.VALOR) AS CUOTA_PAGO,
        SUM(PagosSV.MORA) AS MORA_PAGO,
        SUM(PagosSV.SERV) AS SERV_PAGO
    FROM
        PagosSV
    WHERE
        PagosSV.CONFIRMACION != 'INVALIDO'
    GROUP BY
        FICHA
) PagosSV
ON
    PagosSV.FICHA = Fichas.FICHA
WHERE
    Fichas.?? LIKE ?;`
        // HAVING
        //     SALDO > 0;
        , [MODO, CTE]);

    if (fichas.length > 0) {
        return fichas;
    }

    return [];
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
    } finally {
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


const updateMoraYServAnt = async ({ MORA_ANT, SERVICIO_ANT, FICHA }) => {
    const [update_result] = await pool.query(
        "UPDATE Fichas SET ? WHERE Ficha = ? ", [{ MORA_ANT, SERVICIO_ANT }, FICHA]);

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

const getAcumuladoDetalle = async (query = { "true": true }) => {
    try {
        const [pagos] = await pool.query(
            `SELECT FICHA,VALOR,SERV,MORA,FECHA,COBRADOR FROM PagosSVAcumulado WHERE ? 
            UNION 
            SELECT FICHA,VALOR,SERV,MORA,FECHA,COBRADOR From PagosSV WHERE ? AND PagosSV.CONFIRMACION != 'INVALIDO' order by FECHA`, [query, query]);

        return pagos;

    } catch (error) {
        console.log("error", error);
        return [];
    }

}



module.exports = { cargarPago, getAcumuladoByCteFicha, getFechasDePagosYCobradores, getFichasByCte, getPagoByCodigo, getPagosByFechaYCob, insertCambioDeFecha, updateDistribucionByCodigo, updateEstadoPagoByCodigo, updateMoraYServAnt, updateSaldosAnterioresYServicios, invalidarPago, getPagosMP, getAcumuladoDetalle }