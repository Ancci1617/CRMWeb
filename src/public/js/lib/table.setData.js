
function setData(table_data, data) {


    var tableFragment = new DocumentFragment();


    //Si no hay datos en la tabla correspondientes elimina todos los hijos excepto el primero y lo deja en ceros "0"
    if (data.length == 0) {
        while (table_data.children.length !== 1) { table_data.removeChild(table_data.lastChild) };
        [...table_data.children[0].children].map(e => e.innerText = "0");
        return;
    };


    let row_cl = [...table_data.children[0].children].map(e => e.classList);
    for (let i = 0; i < data.length; i++) {
        let query_values = Object.values(data[i]);
        let tr = document.createElement("tr");

        for (let i = 0; i < query_values.length; i++) {
            //GENERA TD
            let td = document.createElement("td");

            //INGRESA INNER TEXT DE LA CONSULTA
            td.innerText = query_values[i];

            //CONDICIONAL DE FORMATOS
            if (query_values[i] == "DESAPROBADO" || query_values[i] == "CLAVAZO")
                td.classList.add("zona");
            if (query_values[i] == "APROBADO") td.classList.remove("zona")

            //AGREGA LAS MISMAS CLASES QUE TIENE LA CELDA VIGENTE
            row_cl[i].forEach(e => {
                td.classList.add(e);
            });
            tr.append(td);

        }
        tableFragment.append(tr);
    }

    table_data.innerHTML = "";
    table_data.append(tableFragment);

}