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

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError,{enableHighAccuracy : true});
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
        const span_text = document.querySelector(`.IMG-${e.target.getAttribute("NAME")}`);
        span_text.innerText = files && files.length > 0 ? files[0].name : "Sin foto cargada..";
    })
})


//EVALUACION DE LA VENTA
form.addEventListener("submit", e => {
    e.preventDefault();

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



const handleLocationError = (error) => {
    console.log(error);
     

    if(error.code == 1){
        alert("No se puede cargar la venta, la ubicacion se encuentra desabilitada.");
        return location.href = "/crm"
    }
    console.log("Error desconocido",error);
    alert(`Error desconocido ${error}, CODE ${error.code}`);
}

const handleLocationSuccess = (location) => {
    const {latitude,longitude,accuracy} = location.coords 
    console.log(location.coords);
    document.querySelector("input[name='latitude']").value = latitude;
    document.querySelector("input[name='longitude']").value = longitude;
    document.querySelector("input[name='accuracy']").value = accuracy;
}
