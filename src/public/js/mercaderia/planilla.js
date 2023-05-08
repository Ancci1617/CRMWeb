const options_selector = document.querySelectorAll("select.option-input");
const input = document.querySelectorAll("input.hidden.select_input");
const btn_actualiza = document.querySelector(".btn-actualiza");
const form_planilla = document.querySelector(".form-carga");


btn_actualiza.addEventListener("click", e=> {
    form_planilla.submit(); 
});

