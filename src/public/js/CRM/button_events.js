const btn_venta = document.querySelector(".btn-ventas")
const btn_mercaderia = document.querySelector(".btn-mercaderia")




btn_venta.addEventListener("click", e => {
    const cte_evaluado = document.querySelector(".num_cliente").innerHTML;
    const link = document.createElement("a");
    link.href = "/cargar_venta/" + cte_evaluado;
    link.click();
})

btn_mercaderia.addEventListener("click", e => {
    const cte_evaluado = document.querySelector(".num_cliente").innerHTML;
    const link = document.createElement("a");
    link.href = "/entrega_retiro/" + cte_evaluado;
    link.click();
})






