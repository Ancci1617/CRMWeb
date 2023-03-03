"use strict";
const btn_nuevo = document.querySelector(".btn-nuevo");
const btn_submit = document.querySelector(".button input");
const form = document.querySelector("form");
const articulos = document.getElementsByName("ARTICULOS")[0];
const cuotas = document.getElementsByName("CUOTAS")[0];
const estatus_options =document.querySelector(".options-estatus");


//Funciones
function asociarInputOption(displayedOptions, input) {
    //Recibe un input y un options
    displayedOptions.addEventListener("change", e => {
        input.value = displayedOptions.options.item(displayedOptions.selectedIndex).innerText;
    })

}
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
async function ventaAprobada(CTE, responsable, Estatus, cuotas_para_entrega = 0, vendido) {
    //TODO ESTE BLOQUE DE CODIGO TRANSFORMALO EN EL JSON DEL FORM
    const sabana = 24000; //Transformar esto a consulta SQL
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


    //Si el vendedor se hacer cargo esta aprobada
    if (responsable == "SI") return true;

    //Si es prepago solo hace evaluacion de la cuotas de entrega
    console.log(CTE, responsable, Estatus, cuotas_para_entrega, vendido)
    console.log("prepago",Estatus === 'Prepago');
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

    //Si lo vendido es menor al disponible
    console.log(master);
    let disponible = parseFloat(master.BGM.replace(",", "."))
    let anticipo = 4000; //TRANSFORMAR EN PARAMETRO


    //AUMENTA EL DISPONIBLE CON EL ANTICIPO?
    if(anticipo >= cuotas.value ){
        
    }
    
    

    if (vendido / sabana <= disponible) return true;


    //Si no se cumplen las condiciones desaprobada 
    return false;

}

//ASOCIA TODOS LOS INPUTS CON SU SELECTOR RESPECTIVO EN EL ORDEN
for (let i = 0; i < document.querySelectorAll("select").length; i++) {
    asociarInputOption(document.querySelectorAll("select")[i], document.querySelectorAll("input.hidden")[i]);
}

estatus_options.addEventListener("change",e=>{
    let selected_options = e.target;
    let selected_text = selected_options.options.item(selected_options.selectedIndex).innerText;
    if(selected_text.includes("Prepago")){
       return document.querySelector(".input-box.cuotas_para_entrega").classList.remove("hidden");
    }
    return document.querySelector(".input-box.cuotas_para_entrega").classList.add("hidden");

})








//Listeners
btn_nuevo.addEventListener("click", e => {
    //Limpiar input box
    let input_array = document.querySelectorAll(".input-box input");
    input_array.forEach(e => {if(!input_array[7].classList.contains("hidden")){ e.value = ""}});

    //Cambiar numero de cliente a nuevo
    document.getElementsByName("CTE")[0].value = "Nuevo";


})


form.addEventListener("submit", async e => {
    e.preventDefault();

    const CTE = document.getElementsByName("CTE")[0];
    const responsable = document.getElementsByName("RESPONSABLE")[0].value;
    const Estatus = document.getElementsByName("ESTATUS")[0].value;
    const cuotas_para_entrega = document.getElementsByName("CUOTAS_PARA_ENTREGA")[0].value;
    const vendido = document.getElementsByName("TOTAL")[0].value;
    let aprobado = document.getElementsByName("APROBADO")[0];

    if (await ventaAprobada(CTE.value, responsable, Estatus, cuotas_para_entrega, vendido)) {
        aprobado.value = "APROBADO";
        CTE.disabled = false;
        return e.target.submit();
    }

    if (confirm("La venta esta DESAPROBADA, ¿cargar igualmente?")) {
        aprobado.value = "DESAPROBADO";
        CTE.disabled = false;
        return e.target.submit();
    }

})

articulos.addEventListener("change", e => {
    //Antes tiene que escribir la cantidad de cuotas
    if (cuotas.value == "") {
        articulos.value = "";
        return alert("Antes debe escribir la cantidad de cuotas");
    }
    autoCompletarPrecios();
})

document.querySelector(".selector-cuotas").addEventListener("change", e => {
    //Antes tiene que escribir la cantidad de cuotas
    if (articulos.value == "") return;
    autoCompletarPrecios();
})






