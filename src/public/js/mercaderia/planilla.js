const options_selector = document.querySelectorAll("select.option-input");
const input = document.querySelectorAll("input.hidden.select_input");
const btn_actualiza = document.querySelector(".btn-actualiza");
const form_planilla = document.querySelector(".form-carga");
const input_art = document.getElementsByName("ART")[0];

//Sin " " al completar él formulario de sobrecarga
if (input_art) {
    input_art.addEventListener("keydown", keyEvent => {
        if (keyEvent.key == " ") keyEvent.preventDefault();
    })
}


if (btn_actualiza) {
    btn_actualiza.addEventListener("click", e => {
        form_planilla.submit();
    });
}




