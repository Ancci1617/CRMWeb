const select_vendedor = document.querySelector(".select-vendedor");
const select_fecha = document.querySelector(".select-fecha");
const btn_consulta = document.querySelector(".btn-consultar-ventas");
const tabla_ventas = document.querySelector("iframe");


btn_consulta.addEventListener("click", async e => {
    let vendedor = select_vendedor.options.item(select_vendedor.selectedIndex).innerText;
    let fecha_de_venta = select_fecha.options.item(select_fecha.selectedIndex).innerText;
    let location = tabla_ventas.contentWindow.location;
    location.href = location.origin + location.pathname + "?VENDEDOR=" + vendedor + "&FECHA=" + fecha_de_venta;
    
});












