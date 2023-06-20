const pool = require("../../model/connection-database");


async function insertPedido(DIA, HORA, CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO, QUE_NECESITA, DIA_VISITA, DESDE, HASTA, DESIGNADO, ESTADO, EVALUACION, EVALUACION_DETALLE, USUARIO) {
    const [res] = await pool.query(
        "INSERT INTO `Pedidos` " +
        "( `DIA`, `HORA`, `CTE`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`CRUCES`, `CRUCES2`, `TELEFONO`, `QUE_NECESITA`, `DIA_VISITA`, " +
        "`DESDE`, `HASTA`, `DESIGNADO`, `ESTADO`, `EVALUACION`, `EVALUACION_DETALLE`,`REDES`) VALUES " +
        "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

        , [DIA, HORA, CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO,
            QUE_NECESITA, DIA_VISITA, DESDE, HASTA, DESIGNADO, ESTADO,
            EVALUACION, EVALUACION_DETALLE, USUARIO]

    );


    if (res.length > 0) {
        return res;
    }

    return null;

}


async function getPedidosByFiltros(DESIGNADO = "%", ESTADO = "%", FECHA_VISITA = "%") {

    const [pedidos] = await pool.query(
        "SELECT `ID`, `REDES`,`DIA`, `HORA`, `CTE`, `ZONA`, `NOMBRE`, `CALLE`, " +
        "`CRUCES`, `CRUCES2`, `TELEFONO`, `QUE_NECESITA`, `DIA_VISITA`, " +
        "`DESDE`, `HASTA`, `DESIGNADO`, `ORDEN`, `ESTADO`, `EVALUACION`,`VISITADO`, " +
        "`EVALUACION_DETALLE` FROM `Pedidos` WHERE `DESIGNADO` LIKE ? and ESTADO LIKE ? and DIA_VISITA like ? order by ORDEN"
        , [DESIGNADO, ESTADO, FECHA_VISITA]);


    if (pedidos.length > 0) {
        return pedidos;
    }

    return [];

}
async function getPedidoByID(ID) {

    const [pedido] = await pool.query(
        "SELECT `ID`, `DIA`, `HORA`, `CTE`, `ZONA`, `NOMBRE`, `CALLE`, `CRUCES`, `CRUCES2`, `TELEFONO`, " +
        "`QUE_NECESITA`, `DIA_VISITA`, `DESDE`, `HASTA`, `DESIGNADO`, `ORDEN`, `ESTADO`,`REDES`, `MOTIVO`, " +
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


    return null;

}


async function updatePedidoByID({ CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO, QUE_NECESITA, DIA_VISITA, DESDE, HASTA, DESIGNADO, REDES, MOTIVO = "", ESTADO = "PENDIENTE" }, ID) {


    const [update] = await pool.query(
        "UPDATE `Pedidos` SET `CTE`=? , `ZONA`=? , `NOMBRE`=? , `CALLE`=?, " +
        "`CRUCES`=?,`CRUCES2`=?,`TELEFONO`=?,`QUE_NECESITA`=?,`DIA_VISITA`=?, " +
        "`DESDE`=?,`HASTA`=?,`DESIGNADO`=?,`REDES`=?,`MOTIVO`=?,`ESTADO`=? WHERE ID = ?"

        , [CTE, ZONA, NOMBRE, CALLE, CRUCES, CRUCES2, TELEFONO, QUE_NECESITA, DIA_VISITA, DESDE, HASTA, DESIGNADO, REDES, MOTIVO, ESTADO, ID]);

    return update;



}


async function updatePedidosCerrar(ESTADO, MOTIVO,VISITADO, ID) {

    const [pedidos] = await pool.query(
        "UPDATE `Pedidos` SET `ESTADO` = ?, `MOTIVO` = ?,`VISITADO` = ?  WHERE ID = ? "
        , [ESTADO, MOTIVO,VISITADO, ID]);


    if (pedidos.length > 0) {
        return pedidos;
    }

    return null;

}
async function updatePedidosReprogramar({ MOTIVO, ESTADO, ID, FECHA, DESDE, HASTA }) {

    const [pedidos] = await pool.query(
        "UPDATE `Pedidos` SET `MOTIVO` = ?, `ESTADO` = ? ,`DIA_VISITA` = ?,`DESDE` = ? , `HASTA` = ?,`ORDEN` = 0  WHERE ID = ? "
        , [MOTIVO, ESTADO, FECHA, DESDE, HASTA, ID]);


    if (pedidos.length > 0) {
        return pedidos;
    }

    return null;

}

async function getPedidosActivos(today) {

    const [pedidos] = await pool.query(
        "SELECT `ID`, `DIA`,  `CTE`, `ZONA`, `NOMBRE`, `CALLE`, `CRUCES`, `CRUCES2`, `TELEFONO`, `QUE_NECESITA`, `DIA_VISITA`, `DESIGNADO`,ORDEN, `REDES`, `ESTADO`,  " +
        "`MOTIVO`, `EVALUACION` FROM `Pedidos` WHERE (ESTADO = 'PENDIENTE' or ESTADO = 'ACTIVO') AND (`DIA_VISITA` <= ?) order by ORDEN;",[today]
    );


    if (pedidos.length > 0) {
        return pedidos;
    }

    return [];

}
async function getPedidosProximos(today) {

    const [pedidos] = await pool.query(
        "SELECT `ID`, `DIA`,  `CTE`, `ZONA`, `NOMBRE`, `CALLE`, `CRUCES`, `CRUCES2`, `TELEFONO`, "+
        "`QUE_NECESITA`, `DIA_VISITA`, `DESIGNADO`,ORDEN, `REDES`, `ESTADO`,`MOTIVO`, " +
        "`EVALUACION` FROM `Pedidos` WHERE (DIA_VISITA > ?) AND (ESTADO = 'PENDIENTE' or ESTADO = 'ACTIVO') order by ORDEN;",
        [today]
    );


    if (pedidos.length > 0) {
        return pedidos;
    }

    return [];

}
async function getPedidosTerminados() {

    const [pedidos] = await pool.query(
        "SELECT `ID`, `DIA`,  `CTE`, `ZONA`, `NOMBRE`, `CALLE`, `CRUCES`, `CRUCES2`, `TELEFONO`, "+
        "`QUE_NECESITA`, `DIA_VISITA`, `DESIGNADO`,ORDEN, `REDES`, `ESTADO`,`MOTIVO`,VISITADO, " +
        "`EVALUACION` FROM `Pedidos` WHERE ESTADO = 'HECHO' order by DIA_VISITA DESC;",
     
    );


    if (pedidos.length > 0) {
        return pedidos;
    }

    return [];

}

async function getPedidosAcumulados() {
    const [pedidos] = await pool.query(
        "SELECT `ID`, `DIA`,  `CTE`, `ZONA`, `NOMBRE`, `CALLE`, `CRUCES`, `CRUCES2`, `TELEFONO`, `QUE_NECESITA`, `DIA_VISITA`, `DESIGNADO`, `REDES`, `ESTADO`, `MOTIVO`, `EVALUACION` FROM `Pedidos` WHERE ESTADO = 'PENDIENTE' or ESTADO = 'ACTIVO' order by DIA,DESIGNADO,ESTADO;"
    );


    if (pedidos.length > 0) {
        return pedidos;
    }

    return [];
}

module.exports = {
    insertPedido, getPedidosByFiltros, updateOrdersAndEstadoById,
    updatePedidosCerrar, getPedidoByID, updatePedidosReprogramar, getPedidosActivos,
    updatePedidoByID, getPedidosAcumulados,getPedidosProximos,getPedidosTerminados
}