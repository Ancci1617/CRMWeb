const btn_venta = document.querySelector(".btn-ventas")
const btn_mercaderia = document.querySelector(".btn-mercaderia")
const btn_pedido = document.querySelector(".btn-pedido")
const btn_contacto = document.querySelector(".btn-contacto")

function getCteEvaluado(){
    return document.querySelector(".num_cliente").innerText;
}
function gotoLink(link){
    const a = document.createElement("a");
    a.href = link;
    a.click();
}

btn_pedido.addEventListener("click",()=> gotoLink(`pedidos/cargar_pedido/${getCteEvaluado()}`));
btn_venta.addEventListener("click", () => {gotoLink(`/cargar_venta/${getCteEvaluado()}`)});
btn_mercaderia.addEventListener("click",() => {gotoLink(`/entrega_retiro/${getCteEvaluado()}`)})
btn_contacto.addEventListener("click",()=>{gotoLink(`/contactos/generar_contacto/${getCteEvaluado()}`)})





