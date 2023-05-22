const pool = require("../../model/connection-database");


async function insertPedido(DIA, HORA, CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO, QUE_NECESITA, DIA_VISITA, DESDE, HASTA, DESIGNADO, ESTADO, EVALUACION, EVALUACION_DETALLE,USUARIO) {
    const [res] = await pool.query(
        "INSERT INTO `Pedidos` " +
        "( `DIA`, `HORA`, `CTE`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`CRUCES`, `CRUCES2`, `TELEFONO`, `QUE_NECESITA`, `DIA_VISITA`, " +
        "`DESDE`, `HASTA`, `DESIGNADO`, `ESTADO`, `EVALUACION`, `EVALUACION_DETALLE`,`REDES`) VALUES " +
        "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

        , [DIA, HORA, CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO,
            QUE_NECESITA, DIA_VISITA, DESDE, HASTA, DESIGNADO, ESTADO,
            EVALUACION, EVALUACION_DETALLE,USUARIO]

    );


    if (res.length > 0) {
        return res;
    }

    return null;

}


async function getPedidosByDesignado(DESIGNADO,ESTADO = "%") {
 
    const [pedidos] = await pool.query(
        "SELECT `ID`, `DIA`, `HORA`, `CTE`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`CRUCES`, `CRUCES2`, `TELEFONO`, `QUE_NECESITA`, `DIA_VISITA`, " +
        "`DESDE`, `HASTA`, `DESIGNADO`, `ORDEN`, `ESTADO`, `EVALUACION`, " +
        "`EVALUACION_DETALLE` FROM `Pedidos` WHERE `DESIGNADO` = ? and ESTADO LIKE ? order by ORDEN"
        , [DESIGNADO,`${ESTADO}`]);
    

    if (pedidos.length > 0) {
        return pedidos;
    }

    return [];

}
async function getPedidoByID(ID) {

    const [pedido] = await pool.query(
        "SELECT `ID`, `DIA`, `HORA`, `CTE`, `ZONA`, `NOMBRE`, `CALLE`, `CRUCES`, `CRUCES2`, `TELEFONO`, " +
        "`QUE_NECESITA`, `DIA_VISITA`, `DESDE`, `HASTA`, `DESIGNADO`, `ORDEN`, `ESTADO`, `MOTIVO`, " +
        "`EVALUACION`, `EVALUACION_DETALLE` FROM `Pedidos` WHERE ID = ?"
        , [ID]

    );


    if (pedido.length > 0) {
        return pedido[0];
    }

    return null;


}


async function updateOrdersAndEstadoById(ID_VALUES) {

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('CREATE TEMPORARY TABLE CAMBIOS_DE_ORDEN ( ID varchar(5), ORDEN varchar(20) , ESTADO varchar(20)) ENGINE=MEMORY; ');
        await connection.query("INSERT into CAMBIOS_DE_ORDEN (ID,ORDEN,ESTADO) VALUES ?; ", [ID_VALUES]);
        await connection.query("UPDATE Pedidos,CAMBIOS_DE_ORDEN SET Pedidos.ORDEN = CAMBIOS_DE_ORDEN.ORDEN, Pedidos.ESTADO = CAMBIOS_DE_ORDEN.ESTADO WHERE Pedidos.ID = CAMBIOS_DE_ORDEN.ID; ");
        await connection.query("DROP TABLE CAMBIOS_DE_ORDEN");


        await connection.commit();
    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        await connection.release();
    }





    // const [pedidos] = await pool.query(
    //     "CREATE TEMPORARY TABLE CAMBIOS_DE_ORDEN ( ID varchar(5), ORDEN varchar(20) ) ENGINE=MEMORY; " +
    //     "INSERT into CAMBIOS_DE_ORDEN (ID,ORDEN) VALUES (7,10) , (3,20); " +
    //     "UPDATE Pedidos,CAMBIOS_DE_ORDEN SET Pedidos.ORDEN = CAMBIOS_DE_ORDEN.ORDEN WHERE Pedidos.ID = CAMBIOS_DE_ORDEN.ID; "
    // );

    // console.log("pedidos", pedidos);

    // if (pedidos.length > 0) {
    //     return pedidos;
    // }

    return null;

}


async function updatePedidoByID({CTE,ZONA,NOMBRE,CALLE,CRUCES,CRUCES2,TELEFONO,QUE_NECESITA,DIA_VISITA,DESDE,HASTA,DESIGNADO,REDES},ID){

    
    const [update] = await pool.query(
        "UPDATE `Pedidos` SET `CTE`=? , `ZONA`=? , `NOMBRE`=? , `CALLE`=?, " + 
        "`CRUCES`=?,`CRUCES2`=?,`TELEFONO`=?,`QUE_NECESITA`=?,`DIA_VISITA`=?, "+
        "`DESDE`=?,`HASTA`=?,`DESIGNADO`=?,`REDES`=? WHERE ID = ?"

        ,[CTE,ZONA,NOMBRE,CALLE,CRUCES,CRUCES2,TELEFONO,QUE_NECESITA,DIA_VISITA,DESDE,HASTA,DESIGNADO,REDES,ID] );

    return update;



}


async function updatePedidosCerrar(ESTADO,MOTIVO, ID) {

    const [pedidos] = await pool.query(
        "UPDATE `Pedidos` SET `ESTADO` = ?, `MOTIVO` = ?  WHERE ID = ? "
        , [ESTADO,MOTIVO, ID]);


    if (pedidos.length > 0) {
        return pedidos;
    }

    return null;

}
async function updatePedidosReprogramar({MOTIVO ,ESTADO ,ID ,FECHA,DESDE,HASTA }) {

    const [pedidos] = await pool.query(
        "UPDATE `Pedidos` SET `MOTIVO` = ?, `ESTADO` = ? ,`DIA_VISITA` = ?,`DESDE` = ? , `HASTA` = ?,`ORDEN` = 0  WHERE ID = ? "
        , [MOTIVO,ESTADO,FECHA,DESDE,HASTA,ID]);


    if (pedidos.length > 0) {
        return pedidos;
    }

    return null;

}

async function getPedidosActivos() {

    const [pedidos] = await pool.query(
        "SELECT `ID`, `DIA`,  `CTE`, `ZONA`, `NOMBRE`, `CALLE`, `CRUCES`, `CRUCES2`, `TELEFONO`, `QUE_NECESITA`, `DIA_VISITA`, `DESIGNADO`, `REDES`, `ESTADO`, `MOTIVO`, `EVALUACION` FROM `Pedidos` WHERE ESTADO = 'PENDIENTE' or ESTADO = 'ACTIVO' order by DIA,DESIGNADO,ESTADO;"
    );


    if (pedidos.length > 0) {
        return pedidos;
    }

    return [];

}

module.exports = { insertPedido, getPedidosByDesignado, updateOrdersAndEstadoById, updatePedidosCerrar ,getPedidoByID,updatePedidosReprogramar,getPedidosActivos,updatePedidoByID}