const input = document.querySelector("main.table__historial .table__header input");
const table__historial__body = document.querySelector("main.table__historial table tbody");
const table__controles__body = document.querySelector("main.table__controles table tbody");
const UNIDAD = window.location.pathname.split("/")[2];
const select_horarios = document.querySelector(".select_horarios");

//filtro de historial
input.addEventListener("change", async e => {
    const FILTRO = e.target.value;
    await fetchPostAndSetTable("/cargas_camionetas/filtro",table__historial__body,{UNIDAD,FILTRO});
});

select_horarios.addEventListener("change", async e => {
    const FECHAHORA = e.target.selectedOptions[0].innerText;
    await fetchPostAndSetTable("/cargas_camionetas/consulta_controles", table__controles__body, {UNIDAD,FECHAHORA});
});

select_horarios.addEventListener("focus", e => {
    e.target.selectedIndex = -1;
});
