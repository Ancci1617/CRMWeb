const pool = require("../../connection-database.js");


//UNIFICAR ESTOS 2
const getClientes = async (cte) => {

    const [rows] = await pool.query(
        `SELECT
        ClientesSV.CTE,
        ClientesSV.ZONA,
        ClientesSV.NOMBRE,
        ClientesSV.CALLE,
        ClientesSV.CRUCES,
        ClientesSV.CRUCES2,
        (SELECT BaseCTE.TELEFONO FROM BaseCTE WHERE cte = ? AND ID = (SELECT MAX(ID) from BaseCTE where CTE = ?)) AS WHATSAPP,
        ClientesSV.DNI,
        MasterResumen.CALIF AS MASTER,
        NULL AS OBS
    FROM
        ClientesSV
    LEFT JOIN MasterResumen	 ON MasterResumen.Cliente = ClientesSV.CTE
    WHERE
        ClientesSV.CTE = ?
    LIMIT 1;`, [cte, cte, cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [{
        CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES: null, CRUCES2: null, DNI: null
    }];

}



const getClientesFull = async (cte) => {

    const [rows] = await pool.query(
        `SELECT
        ClientesSV.CTE,
        Fichas.FICHA,
        ClientesSV.ZONA,
        ClientesSV.NOMBRE,
        ClientesSV.CALLE,
        ClientesSV.CRUCES,
        ClientesSV.CRUCES2,
        BaseCTE.TELEFONO AS WHATSAPP,
        ClientesSV.DNI,
        MasterResumen.CALIF AS MASTER,
        NULL AS OBS,
        Fichas.ARTICULOS as ARTICULO
    FROM
        ClientesSV
    LEFT JOIN (SELECT * from BaseCTE where BaseCTE.VALIDACION = 'VALIDO') BaseCTE ON BaseCTE.CTE = ClientesSV.CTE
    LEFT JOIN MasterResumen	 ON MasterResumen.Cliente = ClientesSV.CTE
    LEFT join Fichas on Fichas.CTE = ClientesSV.CTE 
    WHERE
        ClientesSV.CTE = ?
    ORDER BY
        BaseCTE.ID
    DESC`, [cte]);

    if (rows.length > 0) {
        return rows;
    }

    return [{
        CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES: null, CRUCES2: null, DNI: null
    }];

}

const getClientesAndLocation = async (cte) => {

    const [rows] = await pool.query(
        `SELECT
        ClientesSV.CTE,
        ClientesSV.ZONA,
        ClientesSV.NOMBRE,
        ClientesSV.CALLE,
        ClientesSV.CRUCES,
        ClientesSV.CRUCES2,
        BaseCTE.TELEFONO AS WHATSAPP,
        ClientesSV.DNI,
        MasterResumen.CALIF AS MASTER,
        NULL AS OBS,
		UBICACIONESSV.LATITUD,UBICACIONESSV.LONGITUD
    FROM
        ClientesSV
    LEFT JOIN (SELECT * FROM BaseCTE WHERE BaseCTE.VALIDACION = 'VALIDO') BaseCTE ON BaseCTE.CTE = ClientesSV.CTE
    LEFT JOIN MasterResumen	 ON MasterResumen.Cliente = ClientesSV.CTE
    LEFT JOIN UBICACIONESSV  on UBICACIONESSV.CALLE = ClientesSV.CALLE
    WHERE
        ClientesSV.CTE = ?
    ORDER BY
    BaseCTE.ID DESC,
		UBICACIONESSV.ID_CALLE DESC
    limit 1;`, [cte]);


    if (rows.length > 0) {
        return rows;
    }

    return [{
        CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES: null, CRUCES2: null, DNI: null
    }];

}



const getClientesYGarante = async (CTE) => {
    try {

        const [data] = await pool.query(
    `SELECT
        ClientesSV.CTE,
        ClientesSV.ZONA,
        ClientesSV.NOMBRE,
        ClientesSV.CALLE,
        ClientesSV.CRUCES,
        ClientesSV.CRUCES2,
        (SELECT BaseCTE.TELEFONO FROM BaseCTE WHERE BaseCTE.CTE = ClientesSV.CTE AND ID = (SELECT MAX(ID) from BaseCTE where BaseCTE.CTE = ClientesSV.CTE)) AS WHATSAPP,
        ClientesSV.DNI,
        GARANTE.CTE as GARANTE_CTE,
        GARANTE.NOMBRE AS GARANTE_NOMBRE,
        GARANTE.CALLE AS GARANTE_CALLE,
        GARANTE.ZONA AS GARANTE_ZONA,
        GARANTE.DNI AS GARANTE_DNI,
        GARANTE.CRUCES AS GARANTE_CRUCES,
        GARANTE.CRUCES2 AS GARANTE_CRUCES2
        FROM
        ClientesSV
        LEFT JOIN (
            SELECT * FROM ClientesSV
        ) GARANTE ON GARANTE.CTE = ClientesSV.GARANTE_CTE
        WHERE
        ClientesSV.CTE = ? ;`, [CTE])

        return data
    } catch (error) {
        console.log("error al consultar listado de prestamo", error);
        

    }


}

module.exports = { getClientes, getClientesFull, getClientesAndLocation, getClientesYGarante }


