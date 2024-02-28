"use strict";
const pool = require("../../model/connection-database.js");
const { getAside } = require("../lib/aside.js");
const  pagosModel  = require("../model/pagos.model.js");
const { getRendicion } = require("../model/rendicion.model.js");


async function cargarEfectivo(req, res) {
    const { ID, EFECTIVO = 0 } = req.body;
    try {
        const [efectivo] = await pool.query(
            "UPDATE `PlanillasDeCobranza` SET EFECTIVO = ?,RECEPCION = ? WHERE ID = ? AND EDITABLE = 1", [EFECTIVO,req.user.Usuario, ID]);

    } catch (error) {
        console.log(error);
        return res.send("No se pudo cargar el efectivo..");
    }
    res.redirect(req.headers.referer);
}

async function updateEditable(req, res) {
    const { ID, EDITABLE = 0 } = req.body;
    try {
        const [res] = await pool.query("UPDATE `PlanillasDeCobranza` SET ? WHERE ID = ?", [{ EDITABLE }, ID]);
    } catch (error) {
        console.log(error);
    }
    res.redirect(req.headers.referer);
}

async function cargarGasto(req, res) {
    const { GASTO = null, MONTO = 0, ID_RENDICION = -1, OBS } = req.body;

    try {
        const [res] = await pool.query(
            "INSERT INTO Gastos (GASTO,MONTO,ID_RENDICION,OBS) " +
            "SELECT ? FROM PlanillasDeCobranza " +
            "WHERE PlanillasDeCobranza.ID = ? AND PlanillasDeCobranza.EDITABLE = 1; ",
            [[GASTO, MONTO, ID_RENDICION, OBS], ID_RENDICION]);

        console.log("cargar gasto", res);
    } catch (error) {
        console.log(error);
    }

    res.redirect(req.headers.referer);

}



async function rendicionReceptor(req, res) {

    const { FECHA = "", COB = "" } = req.query;

    const aside = await getAside()

    if (!(res.locals.hasPermission(res.locals.permisos.RENDICION_ADMIN) || req.user.Usuario == COB || COB == "")) {
        return res.send("No tenes permiso para acceder a esta funcionalidad.");
    }

    const rendicion = await getRendicion({ FECHA, COB });

    const [gastos] = await pool.query(
        "SELECT * from Gastos where ID_RENDICION = (SELECT ID FROM PlanillasDeCobranza WHERE FECHA = ? and COB = ?);", [FECHA, COB]);

    const pagos = await pagosModel.getPagosByFechaYCob({ FECHA, COB, ORDEN: "ID" });

    res.render("pagos/rendiciones/rendicion.receptor.ejs", { aside, rendicion, gastos, FECHA, COB, pagos });
}

async function generarRendicion(req, res) {
    const { FECHA, COB } = req.query;
    try {
        const [create_result] = await pool.query(

            "INSERT INTO `PlanillasDeCobranza`" +
            "(`FECHA`,`COB`, `EDITABLE`,`EFECTIVO`, `RECEPCION`) SELECT " +
            "? where not EXISTS (SELECT true from PlanillasDeCobranza where FECHA = ? and COB = ?);"
            , [[FECHA, COB, 1, 0, req.user.Usuario], FECHA, COB]);
    } catch (error) {
        console.error("error al generar rendicion", error);
    }

    res.redirect(`/rendicion/rendicion_receptor?FECHA=${FECHA}&COB=${COB}`);



}

async function borrarGasto(req, res) {
    const { ID, FECHA, COB } = req.query;

    try {
        const [gasto_eliminado] = await pool.query(
            `DELETE
            FROM
                Gastos
            WHERE
                ID = ? AND EXISTS(
                SELECT
                    TRUE
                FROM
                    PlanillasDeCobranza
                WHERE
                    COB = ? AND FECHA = ? AND EDITABLE = 1
            )`
            , [ID, COB, FECHA]);
        console.log("gasto eliminado", gasto_eliminado);
    } catch (error) {
        console.error(error);
    }

    res.redirect(`/rendicion/rendicion_receptor?FECHA=${FECHA}&COB=${COB}`);
}


module.exports = { rendicionReceptor, generarRendicion, cargarEfectivo, updateEditable, cargarGasto, borrarGasto };