const input_filtro = document.querySelector("main.table__historial .table__header input");
const table__historial__body = document.querySelector("main.table__historial table tbody");
const table__controles__body = document.querySelector("main.table__controles table tbody");
const UNIDAD = "BGM";
const select_horarios = document.querySelector(".select_horarios");

var rows_data;
window.addEventListener("load", e => {
    rows_data = [...table__historial__body.querySelectorAll("tr")];
});

//filtro de historial
input_filtro.addEventListener("change", async e => {
    const FILTRO = e.target.value;
    table__historial__body.innerHTML = "";
    const fragment = new DocumentFragment();
    rows_data.forEach(row => {
        if (row.innerHTML.includes(FILTRO))
            fragment.append(row);
    });
    table__historial__body.append(fragment);
});


select_horarios.addEventListener("change", async e => {
    const FECHAHORA = e.target.selectedOptions[0].innerText;
    await fetchPostAndSetTable("/stock/consultar_controles", table__controles__body, { UNIDAD, FECHAHORA })
});

select_horarios.addEventListener("focus", e => {
    e.target.selectedIndex = -1;
});
