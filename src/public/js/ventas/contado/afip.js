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










