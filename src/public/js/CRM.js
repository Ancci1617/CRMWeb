

const table_clientes = document.querySelector("#tabla-clientes tbody")
var btn_evaluar = document.querySelector(".btn-evaluar")
var CTE = document.querySelector(".inputtext-CTE")




// btn_evaluar.addEventListener("click", (e) => {
//     table_clientes.innerHTML = ""
//     console.log("a")
//     data.forEach(element =>
//         table_clientes.innerHTML +=
//         `<tr>
//             <td>${element["Fecha de venta"]}</td>
//             <td>${element["CTE"]}</td>
//             <td class="zona">${element["Zona"]}</td>
//             <td>Lamarca 962</td>
//             <td>pichincha</td>
//             <td>fleming</td>
//             <td>1124659963</td>
//             <td>447245623</td>
//             <td>447245623</td>
//             <td>${element["Calif"]}</td>
//             <td>${element["Obs"]}</td>
//         </tr>`);
// })

btn_evaluar.addEventListener("click", async (e) => {
    table_clientes.innerHTML = ""
    data = { "CTE": CTE.value }
    const query_result = await fetch("/clientes", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })

    CTE_data = await query_result.json();
    CTE_data = CTE_data[0];
    if(CTE_data.CTE == "not found"){
        return alert("Cliente no encontrado")
    }


    for (var element in CTE_data) {
        CTE_data[element] = CTE_data[element]? CTE_data[element] : "";
    } 
    table_clientes.innerHTML =
        `<tr>
            <td>${CTE_data["CTE"]}</td>
            <td class="zona">${CTE_data["ZONA"]}</td>
            <td>${CTE_data["APELLIDO Y NOMBRE"]}</td>
            <td>${CTE_data["CALLE"]}</td>
            <td>p${CTE_data["CRUCES"]}</td>
            <td>${CTE_data["CRUCES2"]}</td>
            <td>${CTE_data["WHATS APP"]}</td>
            <td>${CTE_data["DNI"]? CTE_data["DNI"] : "Sin dni"}</td>
            <td>${CTE_data["Master"]}</td>
            <td>${CTE_data["OBS"]}</td>
        </tr>`

    //Cobranzas

    });



