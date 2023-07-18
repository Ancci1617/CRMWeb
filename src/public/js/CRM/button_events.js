const btn_venta = document.querySelector(".btn-ventas");
const btn_mercaderia = document.querySelector(".btn-mercaderia");
const btn_pedido = document.querySelector(".btn-pedido");
const btn_contacto = document.querySelector(".btn-contacto");
const btn_pago = document.querySelector(".btn-pago");


window.addEventListener("load", (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.size > 0) evaluarCliente();
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
    if (btn_pedido)
        btn_pedido.addEventListener("click", () => gotoLink(`pedidos/cargar_pedido/${getCteEvaluado()}`));
    if (btn_venta)
        btn_venta.addEventListener("click", () => { gotoLink(`/cargar_venta/${getCteEvaluado()}`) });
    if (btn_mercaderia)
        btn_mercaderia.addEventListener("click", () => { gotoLink(`/entrega_retiro/${getCteEvaluado()}`) })
    if (btn_contacto)
        btn_contacto.addEventListener("click", () => {
            gotoLink(`/contactos/generar_contacto/${getCteEvaluado()}?TIPO=${getCteEvaluado() == 0 ? "Y" : "CTE"}`);
        })
    if (btn_pago)
        btn_pago.addEventListener("click", () => { gotoLink(`pagos/deuda_cte?CTE=${getCteEvaluado()}`) });

}

addBtnEvents();



