const pool = require("../../model/connection-database");


//getContactosImanes,
//getContactosCtes,
//getContactosY

async function getGruposByCode(CODE) {
    const eval = {
        CTE: "SELECT DISTINCT GRUPO_MENSAJE FROM `BaseCTE` WHERE GRUPO_MENSAJE != '' order by GRUPO_MENSAJE",
        Z: "SELECT DISTINCT GRUPO_MENSAJE FROM `BaseZ` where GRUPO_MENSAJE != '' order by GRUPO_MENSAJE",
        Y: "SELECT DISTINCT GRUPO_MENSAJE FROM `BaseY` where GRUPO_MENSAJE != '' order by GRUPO_MENSAJE"
    };

    const grupos = await pool.query(eval[CODE]);
    console.log("grupos",grupos);
    return grupos[0];
}

async function getContactosCteByGrupo(GRUPO) {

    const [contactos] = await pool.query(
        "SELECT `ZONA`, `CTE`, `APELLIDO Y NOMBRE`, `CALLE`, " +
        "`TELEFONO`, `LINEA`, `DIA`, `VALIDACION`, `GRUPO_MENSAJE`, " +
        "`ID` FROM `BaseCTE` WHERE GRUPO_MENSAJE = ?", [GRUPO]);

    return contactos;

}




module.exports = { getContactosCteByGrupo, getGruposByCode };


