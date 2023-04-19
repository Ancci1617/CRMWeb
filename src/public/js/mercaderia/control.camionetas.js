const btn_cargar_control = document.querySelector(".btn-cargar_control");


let query_obj;
async function cargarControl() {
    const controles = document.querySelectorAll(".input-control");
    const vigentes = document.querySelectorAll(".carga_vigente");
    const articulos = document.querySelectorAll(".articulo");
    query_obj = { RESUMEN: { UNIDAD }, CONTROL: [] };

    for (let i = 0; i < controles.length; i++) {
        query_obj.CONTROL.push({
            ART: articulos[i].innerText,
            VIGENTE: vigentes[i].innerText,
            CONTROL: controles[i].value,
            DIFERENCIA: controles[i].value - parseInt(vigentes[i].innerText)
        });
    }
    // query_obj_filtered.CONTROL = query_obj.filter(e => e.DIFERENCIA !== 0);
    let diferencias = query_obj.CONTROL.filter(e => e.DIFERENCIA !== 0);

    let diferencias_string = "";
    diferencias.forEach(art => {
        diferencias_string += `Art : ${art.ART} Dif : ${art.DIFERENCIA} \n`;
    })
    diferencias_string = diferencias_string ? diferencias_string : "Sin diferencias \n";

    if (!confirm(`Tenes las siguientes diferencias: \n ${diferencias_string} \n Cargar control?`))
        return;


    //CARGA EL POST
    const res = await fetch("/cargas_camionetas/cargar_diferencias", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query_obj)
    })
    const respuesta = await res.json();
    alert(respuesta.msg)
}

btn_cargar_control.addEventListener("click", cargarControl)








