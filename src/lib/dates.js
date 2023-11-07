function getToday(){
    return new Date().toISOString().split("T")[0];
    
    // return "2023-11-11"  
}

function getVencidas(vencimiento, today, maximo = 6) {

    let fecha_evaluacion = vencimiento;
    for (var i = 1; fecha_evaluacion < today; i++) {
        fecha_evaluacion = sumarMeses(vencimiento, i);
    }

    return Math.min(i - 1, maximo);
}


//BUG REPASAR
function sumarMeses(fecha, meses) {
    let nuevaFecha = {
        anio: parseInt(fecha.toISOString().split("-")[0]),
        mes: parseInt(fecha.toISOString().split("-")[1]),
        dia: parseInt(fecha.toISOString().split("-")[2].substring(0, 2))
    };

    if (nuevaFecha.mes + meses > 12) {
        nuevaFecha.mes = nuevaFecha.mes + meses - 12;
        nuevaFecha.anio += 1;
    } else {
        nuevaFecha.mes += meses;
    };

    return new Date(`${nuevaFecha.anio}-${nuevaFecha.mes}-${nuevaFecha.dia}`);

}

const dateDiff = (FECHA1,FECHA2) => {
    return (new Date(FECHA1).getTime() - new Date(FECHA2).getTime()) / 1000 / 60 / 60 / 24
}

module.exports = {
    getToday,sumarMeses,getVencidas,dateDiff
}




