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
        ClientesSV.EXCEPCION_DNI,
        (SELECT BaseCTE.TELEFONO FROM BaseCTE WHERE BaseCTE.CTE = ClientesSV.CTE AND ID = (SELECT MAX(ID) from BaseCTE where BaseCTE.CTE = ClientesSV.CTE)) AS WHATSAPP,
        ClientesSV.DNI, 
        MasterResumen.CALIF AS MASTER,
        NULL AS OBS,
		(SELECT UBICACIONESSV.LATITUD FROM UBICACIONESSV WHERE UBICACIONESSV.CALLE = ClientesSV.CALLE AND ID_CALLE = (SELECT MAX(ID_CALLE) from UBICACIONESSV where UBICACIONESSV.CALLE = ClientesSV.CALLE)) AS LATITUD,
		(SELECT UBICACIONESSV.LONGITUD FROM UBICACIONESSV WHERE UBICACIONESSV.CALLE = ClientesSV.CALLE AND ID_CALLE = (SELECT MAX(ID_CALLE) from UBICACIONESSV where UBICACIONESSV.CALLE = ClientesSV.CALLE)) as LONGITUD
    FROM
        ClientesSV
    LEFT JOIN MasterResumen	 ON MasterResumen.Cliente = ClientesSV.CTE
    WHERE
        ClientesSV.CTE = ?
    limit 1;;`, [cte]);


    if (rows.length > 0) {
        return rows;
    }

    return [{
        CTE: null, NOMBRE: null, ZONA: null, CALLE: null, WHATSAPP: null, CRUCES: null, CRUCES2: null, DNI: null
    }];

}








module.exports = { getClientes, getClientesFull, getClientesAndLocation }


