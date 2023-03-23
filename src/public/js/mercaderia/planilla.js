let options_selector = document.querySelectorAll("select.option-input");
let input = document.querySelectorAll("input.hidden.select_input");
let btn_actualiza = document.querySelector(".btn-actualiza");
const form_planilla = document.querySelector(".form-carga");


//Asociar hidden input con select
for(i = 0; i < options_selector.length; i++){
    asociarInputOption(options_selector[i], input[i]);
}


btn_actualiza.addEventListener("click", e=> {
    console.log("n");
    form_planilla.submit(); 

   
});

