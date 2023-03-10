let options_selector = document.querySelectorAll("select.option-input");
let input = document.querySelectorAll("input.hidden");


for(i = 0; i < options_selector.length; i++){
    asociarInputOption(options_selector[i], input[i]);
}


async function enviarJSON() {

    let json_response = {ADICIONAL : {} ,ARTICULOS: [] };
    const table_nodelist = document.querySelectorAll("table tbody tr")

    //Genera el JSON
    for (let i = 0; i < table_nodelist.length; i++) {
        let arr_td = [...table_nodelist][i].querySelectorAll("td");
        let obj = { FICHA: 0, ART: 0, CARGADO: "NULL" };
        let select = arr_td[5].querySelector("select");

        obj.FICHA = arr_td[1].innerText;
        obj.ART = arr_td[4].innerText;
        obj.CARGADO = select.options.item(select.selectedIndex).innerText;      
        
        json_response.ARTICULOS.push(obj);
          
    }


    //CARGAR A LA BASE
    let FECHA = window.location.search.substring(7,17);
    let VENDEDOR = window.location.search.substring(27,window.location.search.length);
    json_response.ADICIONAL.FECHA = FECHA;
    json_response.ADICIONAL.VENDEDOR = VENDEDOR;
    json_response.ADICIONAL.UNIDAD = "AB717";


    console.log(json_response);




    // await fetch("/ventas_cargadas_vendedores", {
    //     method: 'POST',
    //     mode: 'cors',
    //     cache: 'no-cache',
    //     credentials: 'same-origin',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(query)
    // })
    // const ventas = await response.json();


}




