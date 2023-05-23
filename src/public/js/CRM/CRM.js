
const table_clientes = document.querySelector(".tabla-clientes tbody");
const table_fichas = document.querySelector(".tabla-fichas tbody");
const table_prestamos = document.querySelector(".tabla-prestamos tbody");
const table_master_bgm = document.querySelector(".tabla_master_bgm tbody");
const table_master_ec = document.querySelector(".tabla-masterec tbody");
const table_domicilio = document.querySelector(".tabla-domicilio tbody");
const img_cte = document.querySelector(".img-cte");

var btn_evaluar = document.querySelector(".btn-evaluar");
var input_busqueda = document.querySelector(".inputtext-busqueda");

img_cte.addEventListener("click",e =>{
    img_cte.classList.toggle("img-zoom");
    img_cte.classList.toggle("img-cte");
});


input_busqueda.addEventListener("keypress", e => {
    if (e.key == "Enter") evaluarCliente();
});



btn_evaluar.addEventListener("click", evaluarCliente);



//Table_data - > table body a insertar los datos
//data = response.Clientes o response.Fichas
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

            let td = document.createElement("td");
            td.innerText = query_values[i];
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
function getType(data) {


    //Explicito: SI ES EXPLICITO, borra el codigo de el var "data"
    //y separa la var "code" como el codigo a evaluar 
    let code = data.slice(0, 2);
    if (code.includes(":")) {
        data = data.replace(code, "")

        switch (code.toUpperCase()) {
            case "D:":
                return ["Dni", data];
            case "F:":
                return ["Ficha", data];
            case "C:":
                return ["Calle", data];
            case "N:":
                return ["Nombre", data];
            case "T:":
                return ["Telefono", data];
            default:
                return ["Cte", data];

        }
    }

    //Implicito
    let hasString = (data.match("[a-z]") || data.match("[A-Z]"));
    let hasNumber = (data.match("[0-9+]"));

    if (!hasString && hasNumber) {
        if (data.length > 5 && data.length < 10) return ["Dni", data];
        if (data.length > 9) return ["Telefono", data];
    }

    if (hasString && hasNumber) return ["Calle", data];
    if (hasString && !hasNumber) return ["Nombre", data];
    return ["Cte", data];

}
async function evaluarCliente() {
    //Variables de scope
    let Data = input_busqueda.value;
    let selection = document.querySelector(".custom-selectbox-select");
    let tipo_de_dato = selection.options.item(selection.selectedIndex).innerText;


    //Si el tipo es varios, lo identifica automaticamente
    if (tipo_de_dato == "Varios") [tipo_de_dato, Data] = getType(Data);

    const query_result = await fetch("/query_CRM", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Data, tipo_de_dato })
    })
    query_response = await query_result.json()

    //Si el cliente no lo encontro -> alert
    if (query_response.Clientes[0].CTE === -1) return alert(tipo_de_dato + " no se encuentra en la base de datos");

    //Clientes no consulta longitud
    //Tabla clientes, primer fila, todos los td,mapear la lista de clases(un array de classList)3
    setData(table_clientes, query_response.Clientes);
    setData(table_fichas, query_response.Fichas);
    setData(table_prestamos, query_response.Prestamos);
    setData(table_master_ec, query_response.MasterEC);
    setData(table_master_bgm, query_response.MasterBGM);
    setData(table_domicilio, query_response.Domicilio);


    const ofertas = document.querySelectorAll(".disponible-oferta");
    //Insertar ofertasDisponibles
    ofertas[0].innerText = 0;
    ofertas[1].innerText = 0;
    ofertas[2].innerText = 0;
    if (query_response.Disponible.length > 0) {
        ofertas[0].innerText = query_response.Disponible[0].BGM;
        ofertas[1].innerText = query_response.Disponible[0].CAPITAL;
        ofertas[2].innerText = query_response.Disponible[0].CALIF;
    }

    img_cte.src = `/${query_response.Clientes[0].CTE}/CTE-${query_response.Clientes[0].CTE}-ROSTRO.jpg`;

}
