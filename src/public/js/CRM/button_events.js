const btn_venta = document.querySelector(".btn-ventas");
const btn_mercaderia = document.querySelector(".btn-mercaderia");
const btn_pedido = document.querySelector(".btn-pedido");
const btn_contacto = document.querySelector(".btn-contacto");
const btn_pago = document.querySelector(".btn-pago");
const btn_ubicacion = document.querySelector(".btn-ubicacion");
const btn_prestamo = document.querySelector(".btn-prestamo");

window.addEventListener("load", (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.size > 0) evaluarCliente();
    addBtnEvents();

});


function getCteEvaluado() {
    return document.querySelector(".num_cliente").innerText;
}
function gotoLink(link) {
    const a = document.createElement("a");
    a.href = link;
    a.click();
}


function addBtnEvents() {

    btn_pedido?.addEventListener("click", () => gotoLink(`pedidos/cargar_pedido/${getCteEvaluado()}`));

    btn_venta?.addEventListener("click", () => { gotoLink(`/ventas/cargar_venta/${getCteEvaluado()}`) });
    btn_mercaderia?.addEventListener("click", () => { gotoLink(`/entrega_retiro/${getCteEvaluado()}`) })
    btn_contacto?.addEventListener("click", () => {
        gotoLink(`/contactos/generar_contacto/${getCteEvaluado()}?TIPO=${getCteEvaluado() == 0 ? "Y" : "CTE"}`);
    })
    btn_pago?.addEventListener("click", () => { gotoLink(`pagos/deuda_cte?CTE=${getCteEvaluado()}`) });
    btn_prestamo?.addEventListener("click", e => gotoLink(`ventas/prestamos/cargar_prestamo/${getCteEvaluado()}`))
}




