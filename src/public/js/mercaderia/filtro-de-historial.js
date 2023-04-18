const input = document.querySelector("main.table__historial .table__header input");
const table__historial__body = document.querySelector("main.table__historial table tbody");
const UNIDAD = window.location.pathname.split("/")[2];

input.addEventListener("change", async e => {

    const FILTRO = e.target.value;

    let res = await fetch("/cargas_camionetas/filtro", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ UNIDAD, FILTRO })
    })
    const respuesta = await res.json();
    setData(table__historial__body,respuesta);


});

