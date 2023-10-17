const express = require("express");
const { isLoggedIn } = require("../lib/auth");
const Router = express.Router();
const pool = require("../model/connection-database")
const { getDoubt } = require("../lib/doubt.js");
const fs = require("fs")

Router.get("/main", isLoggedIn, (req, res) => {
    res.render("main-menu");
});

Router.get("/", (req, res) => {
    res.redirect("/main");
});

Router.get("/cierre_de_mes_deudas", async (req, res) => {

    let [fichas_data] = await pool.query(
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
    CONVERT(
        IFNULL(SUM(PagosSV.SERV),
        0),
        INTEGER
    ) AS SERV_PAGO,
    SERV_UNIT,
    CUOTA,
    CUOTA_ANT,
    Fichas.CUOTA_ANT - CONVERT(
        IFNULL(SUM(PagosSV.VALOR),
        0),
        INTEGER
    ) AS SALDO,
    CONVERT(
        Fichas.TOTAL / Fichas.CUOTA,
        INTEGER
    ) AS CUOTAS,
    CONVERT(
        IFNULL(SUM(PagosSV.VALOR),
        0),
        INTEGER
    ) AS CUOTA_PAGO,
    Fichas.MORA_ANT,
    CONVERT(
        IFNULL(SUM(PagosSV.MORA),
        0),
        INTEGER
    ) AS MORA_PAGO
 FROM
     Fichas
 LEFT JOIN PagosSV ON PagosSV.FICHA = Fichas.FICHA
 WHERE
    (PagosSV.CONFIRMACION != 'INVALIDO' or PagosSV.CONFIRMACION IS NULL)
 GROUP BY
     Fichas.FICHA`);

     
    fichas_data.forEach((ficha, i) => {
        fichas_data[i].atraso = getDoubt(fichas_data[i]).atraso_evaluado;
    })

    fs.writeFileSync("C:/A - Blanco GusMar/1 - Actual GusMar/CierreDeMes/CierreDeMes SV/CierreDeMes.json", JSON.stringify(fichas_data));
    res.json("ARCHIVO OK")
});
module.exports = Router;