
const select_vendedor = document.querySelector(".select-vendedor");
const select_fecha = document.querySelector(".select-fecha");
const btn_consulta = document.querySelector(".btn-consultar-ventas");
const tabla_ventas = document.querySelector(".tabla-ventas tbody");
const tabla_access = document.querySelector(".tabla-access tbody");


btn_consulta.addEventListener("click", async e => {
    let vendedor = select_vendedor.options.item(select_vendedor.selectedIndex).innerText;
    let fecha_de_venta = select_fecha.options.item(select_fecha.selectedIndex).innerText;
    let query = {VENDEDOR : vendedor, FECHA : fecha_de_venta};

    const response_ventas = await fetch("/archivo_de_entrega_ventas", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    })
    const ventas = await response_ventas.json();
    console.log(ventas);
    setData(tabla_ventas, ventas);



    const response_access = await fetch("/archivo_de_entrega_access", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    })

    const access = await response_access.json();

    setData(tabla_access, access);

});











