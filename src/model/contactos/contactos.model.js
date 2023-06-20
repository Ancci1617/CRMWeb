const pool = require("../../model/connection-database");


//getContactosImanes,
//getContactosCtes,
//getContactosY

async function getNuevoY(){
    const [Y] = await pool.query(
        "SELECT CTE from NCTE WHERE TOMADO = 0 AND TIPO = 'Y' order by CTE LIMIT 1;;"
    );

    if (Y.length > 0) {
        await pool.query("UPDATE `NCTE` SET `TOMADO`='1' WHERE CTE = ?", [Y[0].CTE]);
        return Y[0].CTE;
    }

    return [];
}
async function getContactosByFecha(TIPO,FECHA){
    const eval = {
        CTE: "SELECT concat(ZONA,'-',CTE,'-',NOMBRE,' ',CALLE) AS CONTACTO,TELEFONO from BaseCTE WHERE DIA = ?",
        Z: "SELECT CONCAT(ZONA,'-',Z,'-',NOMBRE,' ',CALLE) AS CONTACTO,TELEFONO FROM `BaseZ` where VALIDACION = 'VALIDO' AND DIA = ?",
        Y: "SELECT CONCAT(ZONA,'-',Codigo,'-',Nombre,' ',Domicilio) AS CONTACTO,  TELEFONO FROM `BaseY` WHERE VALIDACION = 'VALIDO' and Dia  = ?;"
    };
    const [contactos] = await pool.query(eval[TIPO],FECHA);
    return contactos;

}
async function getFechasContactosByTipo(TIPO){
    const eval = {
        CTE: "SELECT DISTINCT DIA AS FECHA FROM `BaseCTE` WHERE VALIDACION = 'VALIDO' and `LINEA` != 'BASE' order by FECHA DESC",
        Z: "SELECT DISTINCT DIA AS FECHA FROM `BaseZ` WHERE VALIDACION = 'VALIDO' AND DIA != 'ANT' ORDER BY FECHA DESC",
        Y: "SELECT DISTINCT DIA AS FECHA from BaseY where VALIDACION = 'VALIDO' and DIA != 'ANT' ORDER BY `FECHA` DESC"
    };
    const [fechas] = await pool.query(eval[TIPO]);
    return fechas;
}

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


module.exports = {getNuevoY,getContactosByFecha,getFechasContactosByTipo,getContactosParaCampania, getGruposByCode, getContactosByGrupoAndTipo, getContactoByTelefono, invalidarTelefono, insertContacto, updateContactoLlamado };


