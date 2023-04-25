const btn_cargar_control = document.querySelector(".btn-cargar_control");


btn_cargar_control.addEventListener("click", async e => {
    const controles = document.querySelectorAll(".input-control");
    const vigentes = document.querySelectorAll(".carga_vigente");
    const articulos = document.querySelectorAll(".articulo");
    const query_obj = { RESUMEN: { UNIDAD }, CONTROL: [] };

    for (let i = 0; i < controles.length; i++) {
        query_obj.CONTROL.push({
            ART: articulos[i].innerText,
            VIGENTE: vigentes[i].innerText,
            CONTROL: controles[i].value,
            DIFERENCIA: controles[i].value - parseInt(vigentes[i].innerText)
        });
    }

    let diferencias_msg = "";
    query_obj.CONTROL.filter(e => e.DIFERENCIA !== 0).forEach(art => {
        diferencias_msg += `Art : ${art.ART} Dif : ${art.DIFERENCIA} \n`;
    });

    if (!confirm(`Tenes las siguientes diferencias: \n ${diferencias_msg ? diferencias_msg : "Sin diferencias "} \n Cargar control?`))
        return;

    //CARGA EL POST
    const respuesta = await fetchPost("/cargas_camionetas/cargar_diferencias", query_obj);
    alert(respuesta.msg)
})








