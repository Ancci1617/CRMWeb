
const form_redistribuir = document.getElementById("form_redistribuir_pago");
const form__container = document.getElementById("form__container");
const pagos = document.querySelectorAll(".pago");

const section_ordenar = document.querySelector(".section_ordenar");
const borrar_gasto = document.querySelectorAll(".gastos-detalle .borrar_gasto");
const cargar_gasto = document.querySelectorAll(".gastos-detalle .cargar_gasto");

cargar_gasto.forEach(btn_cargar_gasto => {
    btn_cargar_gasto.addEventListener("click", e => {
        if (!confirm("Estas seguro de cargar este gasto?")) return e.preventDefault();
    })
});

borrar_gasto.forEach(btn_borrar_gasto => {
    btn_borrar_gasto.addEventListener("click", e => {
        if (!confirm("Estas seguro de borrar este gasto?")) return e.preventDefault();
    });
});

if (section_ordenar) {
    section_ordenar.addEventListener("change", e => {
        section_ordenar.form.submit();
    })
}



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


var dinero_recibido_por_pago = 0;
pagos.forEach(pago => {
    const button = pago.querySelector(".btn_editar_pago");
    if (!button) return;
    button.addEventListener("click", e => {
        mostrarFormulario(form__container);
        form_redistribuir.CUOTA.value = parseInt(pago.querySelector(".cuota").innerText);
        form_redistribuir.MORA.value = parseInt(pago.querySelector(".mora").innerText);
        form_redistribuir.SERV.value = parseInt(pago.querySelector(".servicio").innerText);
        form_redistribuir.CODIGO.value = pago.querySelector(".codigo").innerText;

        dinero_recibido_por_pago = parseInt(pago.querySelector(".cuota").innerText) + parseInt(pago.querySelector(".mora").innerText) + parseInt(pago.querySelector(".servicio").innerText);


        try {
            form_redistribuir.PROXIMO.value = pago.querySelector(".proxima").innerText;
        } catch (error) {
            console.log("error al generar formulario ", error);
            form_redistribuir.PROXIMO.value = null;
        }


    });

    const confirmar_pago = pago.querySelector(".confirmar_pago");
    confirmar_pago?.addEventListener("click", e => {
        if (!confirm("Estás a punto de confirmar un pago. Esta acción no se puede deshacer. ¿Confirmar?"))
            e.preventDefault();
    })
    const eliminar_pago = pago.querySelector(".invalidar_pago");
    eliminar_pago?.addEventListener("click", e => {
        if (!confirm("Estas seguro que queres eliminar este pago? Esta acción no se puede deshacer."))
            e.preventDefault();
    })

})

form_redistribuir?.addEventListener("submit", e => {
    e.preventDefault();
    const [CUOTA, MORA, SERV] = [...form_redistribuir].map(inp => parseInt(inp.value));
    if (dinero_recibido_por_pago !== CUOTA + MORA + SERV) {
        if (!confirm("El valor del dinero ingresado es distinto, esto afecta a las rendiciones..")) {
            return
        }
    }
    form_redistribuir.submit();
});






