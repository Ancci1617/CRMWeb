const btn_cargar_control = document.querySelector(".btn-cargar_control");

btn_cargar_control.addEventListener("click", async e => {
    const controles = document.querySelectorAll(".input-control");
    const articulos = document.querySelectorAll(".articulo");

    const query_obj = [];
    for (let i = 0; i < controles.length; i++) {
        query_obj.push({
            ART: articulos[i].innerText,
            CONTROL: controles[i].value
        });
    }

    //CARGA EL POST
    const respuesta = await fetchPost("/stock/insertar_deposito_control", query_obj );
    alert(respuesta.msg);
});


