"use strict";
const pool = require("../../model/connection-database.js");
const { pagosModel } = require("../model/pagos.model.js");

async function cargarEfectivo(req, res) {
    const { ID, EFECTIVO = 0 } = req.body;
    try {
        const [efectivo] = await pool.query(
            "UPDATE `PlanillasDeCobranza` SET EFECTIVO = ? WHERE ID = ? AND EDITABLE = 1", [EFECTIVO, ID]);

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

    const data = await pagosModel.getFechasDePagosYCobradores();
    const FECHAS = [...new Set(data.map(obj => obj.FECHA))];
    const render_links = FECHAS.map(fecha_evaluada => {
        return {
            FECHA: fecha_evaluada,
            COBRADORES: data.filter(obj => obj.FECHA == fecha_evaluada).map(obj => obj.COBRADOR)
        }
    });

    const [rendicion] = await pool.query(
        "SELECT Pl.ID,`COB`, Pl.`FECHA`, `EFECTIVO`, `RECEPCION`, `EDITABLE`, SUM(Pa.VALOR + Pa.MORA + Pa.SERV) AS TOTAL_COBRADO, SUM(CASE WHEN Pa.MP_OPERACION IS NOT NULL > 0 AND Pa.MP_OPERACION != '' THEN Pa.SERV + Pa.MORA + Pa.VALOR ELSE 0 END) as MP, IFNULL((SELECT SUM(MONTO) from Gastos where ID_RENDICION = Pl.ID),0) AS TOTAL_GASTOS , SUM(Pa.VALOR + Pa.MORA + Pa.SERV) - SUM(CASE WHEN Pa.MP_OPERACION IS NOT NULL > 0 AND Pa.MP_OPERACION != '' THEN Pa.SERV + Pa.MORA + Pa.VALOR ELSE 0 END) - IFNULL((SELECT SUM(MONTO) from Gastos where ID_RENDICION = Pl.ID),0) - EFECTIVO as DIFERENCIA FROM `PlanillasDeCobranza` Pl Left join PagosSV Pa on Pa.FECHA = Pl.FECHA AND Pa.COBRADOR = Pl.COB WHERE Pl.FECHA = ? and Pl.COB = ?;", [FECHA, COB]);

    console.log("rendicion", rendicion);
    // const gastos = [{ GASTO: "ADELANTO", MONTO: 200, OBS: "obs" }];
    const [gastos] = await pool.query(
        "SELECT * from Gastos where ID_RENDICION = (SELECT ID FROM PlanillasDeCobranza WHERE FECHA = ? and COB = ?);", [FECHA, COB])


    res.render("pagos/rendiciones/rendicion.receptor.ejs", { aside: render_links, rendicion: rendicion[0], gastos, FECHA, COB });
}

async function generarRendicion(req, res) {
    const { FECHA, COB } = req.query;
    try {
        const [create_result] = await pool.query("INSERT INTO `PlanillasDeCobranza` set ?", [{ FECHA, COB, EDITABLE: 1, EFECTIVO: 0, RECEPCION: req.user.Usuario }]);
        console.log(create_result);
    } catch (error) {
        console.error("error al generar rendicion", error);
    }

    res.redirect(`/rendicion/rendicion_receptor?FECHA=${FECHA}&COB=${COB}`);

}

async function borrarGasto(req, res) {
    const { ID, FECHA, COB } = req.query;
    console.log(req.headers);

    try {
        const [gasto_eliminado] = await pool.query("DELETE FROM Gastos where ID = ?", [ID]);
        console.log("gasto eliminado", gasto_eliminado);
    } catch (error) {
        console.error(error);
    }

    res.redirect(`/rendicion/rendicion_receptor?FECHA=${FECHA}&COB=${COB}`);
}


module.exports = { rendicionReceptor, generarRendicion, cargarEfectivo, updateEditable, cargarGasto, borrarGasto };