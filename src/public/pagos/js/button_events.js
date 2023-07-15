const creditos = document.querySelectorAll(".credito");
const form_redistribuir = document.getElementById("form_redistribuir_pago");
const form__container = document.getElementById("form__container");
const pagos = document.querySelectorAll(".pago");

const monthMap = {
    "ene": 0,
    "feb": 1,
    "mar": 2,
    "abr": 3,
    "may": 4,
    "jun": 5,
    "jul": 6,
    "ago": 7,
    "sep": 8,
    "oct": 9,
    "nov": 10,
    "dic": 11
};

pagos.forEach(pago => {
    const button = pago.querySelector(".btn_editar_pago");

    button.addEventListener("click", e => {
        mostrarFormulario(form__container);
        form_redistribuir.CUOTA.value = parseInt(pago.querySelector(".cuota").innerText);
        form_redistribuir.MORA.value = parseInt(pago.querySelector(".mora").innerText);
        form_redistribuir.SERVICIO.value = parseInt(pago.querySelector(".servicio").innerText);
        form_redistribuir.CODIGO.value = parseInt(pago.querySelector(".codigo").innerText);


        const pago_fecha = pago.querySelector(".proxima").innerText.split("-");
        
        console.log(pago_fecha);
        
        form_redistribuir.PROXIMA.value = new Date(pago_fecha[0], pago_fecha[1], pago_fecha[2]).toISOString().split("T")[0];



    });


})


creditos.forEach(credito => {
    const btn_mostrar_detalle = credito.querySelector(".btn-detalles");
    const btn_ocultar_detalle = credito.querySelector(".btn-cerrar-detalle");
    const deep_details = credito.querySelector(".deep_details");

    btn_mostrar_detalle.addEventListener("click", e => {
        deep_details.classList.toggle("show");
    }, false);
    btn_ocultar_detalle.addEventListener("click", e => {
        deep_details.classList.toggle("show");
    }, false);


});




