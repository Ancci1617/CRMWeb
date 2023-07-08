"use strict";
const Router = require("express").Router();
const {getCobranzaByFicha} = require("../model/pagos.model.js");

Router.get("/deuda_cte",async (req,res)=>{
    //Voy a buscar cuanto debe esta ficha..
    const {FICHA} = req.params;

    const cobranza = await getCobranzaByFicha(FICHA);

    



});

function getVencidas(vencimiento,today,maximo = 6) {
    
    let fecha_evaluacion = vencimiento;
    while (fecha_evaluacion <= today) {
        fecha_evaluacion = sumarMeses(fecha_evaluacion,1);

    }

    return Math.min(fecha_evaluacion.toISOString().split("-")[1] - vencimiento.toISOString().split("-")[1],maximo);

}


function sumarMeses(fecha, meses) {
    let nuevaFecha = {
        anio: parseInt(fecha.toISOString().split("-")[0]),
        mes: parseInt(fecha.toISOString().split("-")[1]),
        dia: parseInt(fecha.toISOString().split("-")[2].substring(0, 2))
    };

    if (nuevaFecha.mes + meses > 12) {
        nuevaFecha.mes =  nuevaFecha.mes + meses - 12;
        nuevaFecha.anio += 1;
    }else{
        nuevaFecha.mes += meses
    };
    


    return new Date(`${nuevaFecha.anio}-${nuevaFecha.mes}-${nuevaFecha.dia}`);

}


console.log(getVencidas(new Date("2023-01-09"),new Date("2023-07-9")))



module.exports = Router;




