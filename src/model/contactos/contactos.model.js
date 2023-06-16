const pool = require("../../model/connection-database");


//getContactosImanes,
//getContactosCtes,
//getContactosY

async function getGruposByCode(CODE) {
    const eval = {
        CTE: "SELECT DISTINCT GRUPO_MENSAJE FROM `BaseCTE` WHERE GRUPO_MENSAJE != '' and `VALIDACION` = 'VALIDO' order by GRUPO_MENSAJE",
        Z: "SELECT DISTINCT GRUPO_MENSAJE FROM `BaseZ` where GRUPO_MENSAJE != '' and `VALIDACION` = 'VALIDO' order by GRUPO_MENSAJE",
        Y: "SELECT DISTINCT GRUPO_MENSAJE FROM `BaseY` where GRUPO_MENSAJE != '' and `VALIDACION` = 'VALIDO' order by GRUPO_MENSAJE"
    };

    const grupos = await pool.query(eval[CODE]);

    return grupos[0];
}



async function getContactosByGrupoAndTipo(TIPO, GRUPO, PARALLAMADA) {

    const eval = {
        CTE: "SELECT `NOMBRE`,`TELEFONO`,CTE,ID FROM `BaseCTE` WHERE GRUPO_MENSAJE = ? AND `VALIDACION` = 'VALIDO' order by GRUPO_MENSAJE",
        Z: "SELECT `NOMBRE`,`TELEFONO` FROM `BaseZ` where GRUPO_MENSAJE = ? AND `VALIDACION` = 'VALIDO' order by GRUPO_MENSAJE",
        Y: "SELECT `NOMBRE`,`TELEFONO` FROM `BaseY` where GRUPO_MENSAJE = ? AND `VALIDACION` = 'VALIDO' order by GRUPO_MENSAJE"
    };

    const [grupos] = await pool.query(eval[TIPO], [GRUPO]);
    return grupos;

}
async function getContactosParaCampania( GRUPO) {


    const [grupos] = await pool.query(
        "SELECT `NOMBRE`,`TELEFONO`,CTE,ID FROM `BaseCTE` WHERE GRUPO_MENSAJE = ? and `LLAMADO` = 'POR LLAMAR' order by GRUPO_MENSAJE",
        [GRUPO]);
    
    return grupos;

}
async function getContactoByTelefono(TELEFONO) {
    const [contacto] = await pool.query(
        "SELECT BaseCTE.TELEFONO,'CTE' as TIPO FROM BaseCTE WHERE BaseCTE.TELEFONO = ? UNION " +
        "SELECT BaseZ.TELEFONO,'Z' as TIPO from BaseZ where BaseZ.TELEFONO = ? UNION " +
        "SELECT BaseY.Telefono,'Y' as TIPO FROM BaseY WHERE BaseY.Telefono = ?;"
        , [TELEFONO, TELEFONO, TELEFONO]);


    return contacto;
}

async function updateContactoLlamado(ESTADO, ID) {
    const [contacto] = await pool.query(
        "UPDATE `BaseCTE` SET `LLAMADO`=? WHERE ID = ?"
        , [ESTADO, ID]);

    return contacto;
}

async function invalidarTelefono(TELEFONO) {
    try {

        const [res1] = await pool.query("UPDATE `BaseCTE` SET `VALIDACION`='INVALIDO' where BaseCTE.TELEFONO = ?", [TELEFONO]);
        const [res2] = await pool.query("UPDATE `BaseY` SET `VALIDACION`='INVALIDO'  WHERE Telefono = ?", [TELEFONO]);
        const [res3] = await pool.query("UPDATE `BaseZ` SET `VALIDACION`='INVALIDO' WHERE BaseZ.TELEFONO = ?", [TELEFONO]);

        return { CTE: res1, Y: res2, Z: res3 };
    } catch (error) {
        console.log("ERROR AL MOMENTO DE INVALIDAR TELEFONOS!.\n", error);
        return -1;
    }


}
async function insertContacto(TIPO, TELEFONO, DIA, CTEYZ, ZONA, NOMBRE, CALLE, USUARIO) {


    const eval = {
        CTE:
            "INSERT INTO `BaseCTE` (`TELEFONO`,`CTE`, `ZONA`, `NOMBRE`,`CALLE`,  `LINEA`, `DIA`, `VALIDACION`, `GRUPO_MENSAJE`) " +
            " VALUES ( ?,?,?,?,?,?,?,'VALIDO',13 ) ",

        Z: "INSERT INTO `BaseZ`(`TELEFONO`,`Z`,`ZONA`,`NOMBRE`, `CALLE` ,`LINEA`, `DIA` ,`VALIDACION`, `GRUPO_MENSAJE`) VALUES " +
            "(?,?,?,?,?,?,?,'VALIDO',53) ",

        //el "TOMATO PROXIMAMENTE DESAPARECE"
        Y: "INSERT INTO `BaseY` (`Telefono`,`Codigo`, `ZONA`,`Nombre`,`Domicilio`,  `Linea`,`Dia`, `VALIDACION`, `Tomado`, `GRUPO_MENSAJE`) VALUES " +
            "(?,?,?,?,?,?,?,'VALIDO',1,1)"
    };

    const [res] = await pool.query(eval[TIPO], [TELEFONO, CTEYZ, ZONA, NOMBRE, CALLE, USUARIO, DIA]);
    return res;



}


module.exports = {getContactosParaCampania, getGruposByCode, getContactosByGrupoAndTipo, getContactoByTelefono, invalidarTelefono, insertContacto, updateContactoLlamado };


