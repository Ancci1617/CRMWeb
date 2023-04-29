"use strict";
const btn_nuevo = document.querySelector(".btn-nuevo");
const btn_submit = document.querySelector(".button input");
const form = document.querySelector("form");
const articulos = document.getElementsByName("ARTICULOS")[0];
const cuotas = document.getElementsByName("CUOTAS")[0];
const dni = document.getElementsByName("DNI")[0];
const nombre = document.getElementsByName("NOMBRE")[0];
const estatus_options = document.querySelector(".options-estatus");


dni.addEventListener("change", async e => {
    const dni = e.target.value;
    if(dni > 0)
        return nombre.value = await getRazonSocialDni(dni);    
    return nombre.value = "";
})

// async function getRazonSocialDni(dni){
//     const response_cuit = await fetch(`https://afip.tangofactura.com/Index/GetCuitsPorDocumento/?NumeroDocumento=${dni}`);
//     const response_cuit_json = await response_cuit.json();

//     if(!response_cuit_json.success) 
//         return "Dni invalido"

//     const cuits = response_cuit_json.data;
//     const response_contribuyente = await fetch(`https://afip.tangofactura.com/Index/GetContribuyente/?cuit=${cuits[0]}`);
//     const response_contribuyente_json = await response_contribuyente.json();

//     if(response_contribuyente_json.errorGetData == true || response_contribuyente_json.error)
//         return "Razon social invalida"
//     return response_contribuyente_json.Contribuyente.nombre;

// }

// async function getPrecios(arts) {

//     let total = document.getElementsByName("TOTAL")[0];
//     let cuota = document.getElementsByName("CUOTA")[0];

//     //Enviar matriz de articulos al backend
//     const query = {
//         articulos: articulos.value.trim().split(" "),
//         cuotas: cuotas.value
//     };

//     const response = await fetch("/query_precio", {
//         method: 'POST',
//         mode: 'cors',
//         cache: 'no-cache',
//         credentials: 'same-origin',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(query)
//     })
//     const precios = await response.json();

//     cuota.value = precios.cuota;
//     total.value = precios.total;

// }




articulos.addEventListener("change", e => {
    //Antes tiene que escribir la cantidad de cuotas
    autoCompletarPrecios();
})







