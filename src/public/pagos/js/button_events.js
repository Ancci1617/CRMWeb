const creditos = document.querySelectorAll(".credito");


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




