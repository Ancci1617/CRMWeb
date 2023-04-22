const btn_cargar_control = document.querySelector(".btn-cargar_control");

async function cargarControl() {
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
    const res = await fetch("insertar_deposito_control", {
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
    alert(respuesta.msg);
}

btn_cargar_control.addEventListener("click", cargarControl);


