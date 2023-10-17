"use strict";
const btn_nuevo = document.querySelector(".btn-nuevo");
const btn_submit = document.querySelector(".button input");
const form = document.querySelector("form");
const articulos = document.getElementsByName("ARTICULOS")[0];
const cuotas = document.getElementsByName("CUOTAS")[0];
const cuota = document.getElementsByName("CUOTA")[0];
const estatus_options = document.querySelector(".options-estatus");
const CTE = document.getElementsByName("CTE")[0].value;
const evaluation_data = { sabana: 0, master: 0, prepagos: { 9: "", 12: "" } };
const ANTICIPO_MP = document.getElementsByName("ANTICIPO_MP")[0];
const ANTICIPO_MP_CONTAINER = document.querySelector(".select_anticipo_container");
const ANTICIPO = document.getElementsByName("ANTICIPO")[0];
const ubicacion_cliente = document.querySelector("input[name='ubicacion_cliente']");
const detail_primer_vencimiento = document.querySelector(".detail_primer_vencimiento");
const zonas_sin_servicio_cobranza = ["T3", "T4", "P1", "P2", "D6", "D7", "D8"];


const getServicio = (valor) => {
    if (valor <= 5000) return 500;
    if (valor <= 7500) return 750;
    if (valor <= 10000) return 1000;
    if (valor <= 15000) return 1500;
    return 2000;
}
const handleServicioDeCobranza = () => {

    const servicio = zonas_sin_servicio_cobranza.includes(form.ZONA.value) ? Math.max(getServicio(cuota.value), 1000) : getServicio(cuota.value);
    form.SERV_UNIT.value = servicio;
}



const cualEsPrimerVencimiento = (PRIMER_PAGO, dia) => {
    const dia_mill = (1000 * 60 * 60 * 24);

    const fechas = {
        anterior: {
            fecha: new Date(new Date(PRIMER_PAGO).setUTCMonth(PRIMER_PAGO.getUTCMonth() - 1, dia)),
            difDias: 0
        },
        vigente: {
            fecha: new Date(new Date(PRIMER_PAGO).setUTCMonth(PRIMER_PAGO.getUTCMonth(), dia)),
            difDias: 0
        },
        proximo: {
            fecha: new Date(new Date(PRIMER_PAGO).setUTCMonth(PRIMER_PAGO.getUTCMonth() + 1, dia)),
            difDias: 0
        }
    }
    fechas.anterior.difDias = Math.floor((new Date(fechas.anterior.fecha).setUTCMonth(fechas.anterior.fecha.getUTCMonth() + 1) - PRIMER_PAGO) / dia_mill)
    fechas.vigente.difDias = Math.floor((new Date(fechas.vigente.fecha).setUTCMonth(fechas.vigente.fecha.getUTCMonth() + 1) - PRIMER_PAGO) / dia_mill)
    fechas.proximo.difDias = Math.floor((new Date(fechas.proximo.fecha).setUTCMonth(fechas.proximo.fecha.getUTCMonth() + 1) - PRIMER_PAGO) / dia_mill)

    if (fechas.anterior.difDias <= 40 && fechas.anterior.difDias >= 9) {
        return fechas.anterior.fecha;
    }

    if (fechas.vigente.difDias <= 40 && fechas.vigente.difDias >= 9) {
        return fechas.vigente.fecha;
    }

    return fechas.proximo.fecha;


}

const handlePrimerVencimiento = e => {
    const primer_vencimiento = cualEsPrimerVencimiento(new Date(form.PRIMER_PAGO.value), form.VENCIMIENTO.value);
    form.PRIMER_VENCIMIENTO.value = primer_vencimiento.toISOString().split("T")[0];


    primer_vencimiento.setUTCMonth(primer_vencimiento.getUTCMonth() + 1);
    const string_aux = primer_vencimiento.toISOString().split("T")[0];
    detail_primer_vencimiento.innerText =
        `(${string_aux.split("-")[2]}/${string_aux.split("-")[1]})`

};



ANTICIPO.addEventListener("change", e => {

    if (e.target.value > 0) {
        ANTICIPO_MP.required = true;
        ANTICIPO_MP_CONTAINER.hidden = false;
        return;
    }
    ANTICIPO_MP.required = false;
    ANTICIPO_MP.selectedIndex = 0;
    ANTICIPO_MP_CONTAINER.hidden = true;

})



window.addEventListener("load", async e => {

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, { enableHighAccuracy: true });
    evaluation_data.sabana = await fetchPost("/query_precio", { articulos: ["36"], cuotas: '6' });
    evaluation_data.master = await fetchPost("/query_masterresumen", { CTE });
    evaluation_data.prepagos["9"] = await fetchPost("/query_prepago_entrega", { calificacion: evaluation_data.master.CALIF, cuotas: 9 });
    evaluation_data.prepagos["12"] = await fetchPost("/query_prepago_entrega", { calificacion: evaluation_data.master.CALIF, cuotas: 12 });

    console.log("EVALUATION DATA", evaluation_data);
});

async function autoCompletarPrecios() {

    const total = document.getElementsByName("TOTAL")[0];
    const cuota = document.getElementsByName("CUOTA")[0];

    //Enviar matriz de articulos al backend
    const query = {
        articulos: articulos.value.trim().split(" "),
        cuotas: cuotas.value
    };

    const precios = await fetchPost("/query_precio", query)

    cuota.value = precios.cuota;
    total.value = precios.total;
    handleServicioDeCobranza();
}

function ventaAprobada(CTE, responsable, Estatus, cuotas_para_entrega = 0, vendido, anticipo) {
    //TODO ESTE BLOQUE DE CODIGO TRANSFORMALO EN EL JSON DEL FORM
    //Transformar esto a consulta SQL
    const { sabana, master } = evaluation_data;

    //Genera el disponible en funcion de su calificaicon O BIEN, si tiene disponible
    let disponible;
    if (master.BGM == "REVISAR" || master.BGM == "ATRASADO") {
        disponible = 0;
    } else if (master.BGM == "BLOQUEADO") {
        disponible = -1;
    } else {
        disponible = parseFloat(master.BGM.replace(",", "."));
    }


    //Si el vendedor se hacer cargo esta aprobada
    if (responsable == "SI") return true;

    //Si es prepago solo hace evaluacion de la cuotas de entrega
    if (Estatus === 'Prepago') {

        const cuotas = document.getElementsByName("CUOTAS")[0].value;
        const cuotas_entrega = evaluation_data.prepagos[cuotas];
        if (cuotas_para_entrega >= cuotas_entrega?.ENTREGA) return true;
        return false;

    }


    //AUMENTA EL DISPONIBLE, Si es con anticipo
    if (anticipo >= cuota.value || Estatus.includes("Con anticipo")) disponible += 1;

    //Chequea si le da el disponible
    if (vendido / sabana.total <= disponible) return true;


    //Si no se cumplen las condiciones desaprobada 
    return false;

}



estatus_options.addEventListener("change", e => {
    const selected_options = e.target;
    const selected_text = selected_options.options.item(selected_options.selectedIndex).innerText;
    const input_block = document.querySelector(".input-box.cuotas_para_entrega");
    const input_estatus = document.getElementsByName("CUOTAS_PARA_ENTREGA")[0];

    if (selected_text.includes("Prepago")) {
        input_estatus.setAttribute("required", "")
        return input_block.classList.remove("hidden");
    }
    input_estatus.removeAttribute("required")
    return input_block.classList.add("hidden");

})


//ASOCIAR INPUT-FILE CON LABEL, para appendear el nombre del archivo
const input_file_arr = document.querySelectorAll("input[type='file']")
input_file_arr.forEach(input => {
    input.addEventListener("change", e => {
        const files = e.target.files;
        const span_text = document.querySelector(`.IMG-${e.target.getAttribute("NAME")} `);
        span_text.innerText = files && files.length > 0 ? files[0].name : "Sin foto cargada..";
    })
})

form.PRIMER_PAGO.addEventListener("change", handlePrimerVencimiento);
form.VENCIMIENTO.addEventListener("change", handlePrimerVencimiento);

//EVALUACION DE LA VENTA
form.addEventListener("submit", e => {
    e.preventDefault();
    if (form.TOTAL.value / form.CUOTA.value != form.CUOTAS.value) return alert("El total no es divisible por la cantidad de cuotas")


    const responsable = document.getElementsByName("RESPONSABLE")[0].value;
    const Estatus = document.getElementsByName("ESTATUS")[0].value;
    const cuotas_para_entrega = document.getElementsByName("CUOTAS_PARA_ENTREGA")[0].value;
    const vendido = document.getElementsByName("TOTAL")[0].value;
    const anticipo = document.getElementsByName("ANTICIPO")[0].value;
    const aprobado = document.getElementsByName("APROBADO")[0];

    aprobado.value = "APROBADO";
    const isAprobado = ventaAprobada(CTE, responsable, Estatus, cuotas_para_entrega, vendido, anticipo);
    if (isAprobado)
        return e.target.submit();

    aprobado.value = "DESAPROBADO";
    if (confirm("La venta esta DESAPROBADA, ¿cargar igualmente?"))
        return e.target.submit();


})


//AutoCompletado de los precios
articulos.addEventListener("change", e => {
    autoCompletarPrecios();
});
document.querySelector(".selector-cuotas").addEventListener("change", e => {
    autoCompletarPrecios();
})
cuota.addEventListener("input", handleServicioDeCobranza);
form.ZONA.addEventListener("input", handleServicioDeCobranza);
ubicacion_cliente.addEventListener("keyup", e => {
    ubicacion_cliente.value = ubicacion_cliente.value.replaceAll(" ", "")
});

const handleLocationError = (error) => {

    if (error.code == 1) {
        alert("No se puede cargar la venta, la ubicacion se encuentra desabilitada.");
        return location.href = "/crm"
    }
    console.log("Error desconocido", error);
    alert(`Error desconocido ${error}, CODE ${error.code} `);
}

const handleLocationSuccess = (location) => {
    const { latitude, longitude, accuracy } = location.coords;
    console.log(location.coords);
    document.querySelector("input[name='LATITUD_VENDEDOR']").value = latitude;
    document.querySelector("input[name='LONGITUD_VENDEDOR']").value = longitude;
    document.querySelector("input[name='ACCURACY_VENDEDOR']").value = accuracy;
}
