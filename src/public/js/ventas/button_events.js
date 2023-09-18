


const invalidar = document.querySelectorAll(".btn_invalidar_venta");
const confirmar = document.querySelectorAll(".btn_confirmar_venta");

invalidar.forEach(btn => btn.addEventListener("click", e => {
    if (!confirm("Estas por borrar una venta, esta accion no se puede deshacer."))
        e.preventDefault();
}))
confirmar.forEach(btn => btn.addEventListener("click", e => {
    if (!confirm("Estas por confirmar una venta, esta accion no se puede deshacer."))
        e.preventDefault();
}))













