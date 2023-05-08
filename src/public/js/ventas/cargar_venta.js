"use strict";
const btn_nuevo = document.querySelector(".btn-nuevo");
const btn_submit = document.querySelector(".button input");
const form = document.querySelector("form");
const articulos = document.getElementsByName("ARTICULOS")[0];
const cuotas = document.getElementsByName("CUOTAS")[0];
const cuota = document.getElementsByName("CUOTA")[0];
const estatus_options = document.querySelector(".options-estatus");




async function autoCompletarPrecios() {

    let total = document.getElementsByName("TOTAL")[0];
    let cuota = document.getElementsByName("CUOTA")[0];

    //Enviar matriz de articulos al backend
    const query = {
        articulos: articulos.value.trim().split(" "),
        cuotas: cuotas.value
    };

    const response = await fetch("/query_precio", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    })
    const precios = await response.json();

    cuota.value = precios.cuota;
    total.value = precios.total;

}
async function ventaAprobada(CTE, responsable, Estatus, cuotas_para_entrega = 0, vendido, anticipo) {
    //TODO ESTE BLOQUE DE CODIGO TRANSFORMALO EN EL JSON DEL FORM
    //Transformar esto a consulta SQL
    const sabana = 29400;
    const master_resumen = await fetch("/query_masterresumen", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ CTE })
    })
    const master = await master_resumen.json();

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

        const cuotas = document.getElementsByName("CUOTAS")[0].value
        const entrega_res = await fetch("/query_prepago_entrega", {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ calificacion: master.CALIF, cuotas })
        })
        const cuotas_entrega = await entrega_res.json();

        if (cuotas_para_entrega >= cuotas_entrega.Entrega) return true;
        return false;

    }


    //AUMENTA EL DISPONIBLE, Si es con anticipo
    if (anticipo >= cuota.value || Estatus.includes("Con anticipo")) disponible += 1;

    //Chequea si le da el disponible
    if (vendido / sabana <= disponible) return true;


    //Si no se cumplen las condiciones desaprobada 
    return false;

}



estatus_options.addEventListener("change", e => {
    let selected_options = e.target;
    let selected_text = selected_options.options.item(selected_options.selectedIndex).innerText;
    let input_block = document.querySelector(".input-box.cuotas_para_entrega");
    let input_estatus = document.getElementsByName("CUOTAS_PARA_ENTREGA")[0];

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
form.addEventListener("submit", async e => {
    e.preventDefault();

    const CTE = document.getElementsByName("CTE")[0];
    const responsable = document.getElementsByName("RESPONSABLE")[0].value;
    const Estatus = document.getElementsByName("ESTATUS")[0].value;
    const cuotas_para_entrega = document.getElementsByName("CUOTAS_PARA_ENTREGA")[0].value;
    const vendido = document.getElementsByName("TOTAL")[0].value;
    const anticipo = document.getElementsByName("ANTICIPO")[0].value;
    const aprobado = document.getElementsByName("APROBADO")[0];
    
    aprobado.value = "APROBADO";
    const isAprobado = await ventaAprobada(CTE.value, responsable, Estatus, cuotas_para_entrega, vendido, anticipo);
    if(isAprobado)
        return e.target.submit();
    
    aprobado.value = "DESAPROBADO";
    if (confirm("La venta esta DESAPROBADA, ¿cargar igualmente?")) {
        return e.target.submit();
    }

})


//AutoCompletado de los precios
articulos.addEventListener("change", e => {
    autoCompletarPrecios();
});
document.querySelector(".selector-cuotas").addEventListener("change", e => {
    autoCompletarPrecios();
})






