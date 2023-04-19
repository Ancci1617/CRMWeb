const input = document.querySelector("main.table__historial .table__header input");
const table__historial__body = document.querySelector("main.table__historial table tbody");
const table__controles__body = document.querySelector("main.table__controles table tbody");
const UNIDAD = window.location.pathname.split("/")[2];
const select_horarios = document.querySelector(".select_horarios");

//filtro de historial
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

select_horarios.addEventListener("change",async e => {
    const FECHAHORA = e.target.selectedOptions[0].innerText;

    let res = await fetch("/cargas_camionetas/consulta_controles", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ UNIDAD,FECHAHORA })
    })

    const respuesta = await res.json();
    setData(table__controles__body,respuesta);

})
