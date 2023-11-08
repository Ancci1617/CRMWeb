
const creditos = document.querySelectorAll(".credito_por_cobrar");
const bloquear = document.querySelector(".btn__bloquear");
const desbloquear = document.querySelector(".btn__desbloquear");


const cargarHandler = async () => {

    const creditos = [...document.querySelectorAll(".credito_por_cobrar")]
    const body = creditos.reduce((acumulado, credito, indice) => {
        return [...acumulado, { ORDEN_COBRANZA: indice, ID: credito.querySelector("input[name='ID']").value }]
    }, [])
    console.log(body);
    alert("n")
    const res = await fetch("/cobrador/recorrido", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    const res_json = await res.json();
    return res_json;
}

const ordenarRecorrido = () => {
    let creditos_para_ordenar = [...document.querySelectorAll(".credito_por_cobrar")].filter(credito => !credito.querySelector("input[value=''][name='LATITUD']"));

    let creditos_ordenados = [creditos_para_ordenar[0]];
    for (let i = 0; (i < creditos_ordenados.length && creditos_para_ordenar.length > 0); i++) {

        let latitud_inicial = parseFloat(creditos_ordenados[i].querySelector("input[name='LATITUD']").value);
        let longitud_inicial = parseFloat(creditos_ordenados[i].querySelector("input[name='LONGITUD']").value);


        let creditos_encontrados = []
        let margen = 0.0001
        while (creditos_encontrados.length <= 0 && creditos_para_ordenar.length > 0) {
            creditos_encontrados = creditos_para_ordenar.filter(credito => {
                let latitud_buscar = parseFloat(credito.querySelector("input[name='LATITUD']").value);
                let longitud_buscar = parseFloat(credito.querySelector("input[name='LONGITUD']").value);//

                isLatitudOk = (latitud_buscar > latitud_inicial - margen) && (latitud_buscar < latitud_inicial + margen);
                isLongitudOk = (longitud_buscar > longitud_inicial - margen) && (longitud_buscar < longitud_inicial + margen);

                return isLatitudOk && isLongitudOk
            });
            margen = parseFloat((margen + 0.0001).toFixed(4));
        }
        console.log("desde");
        console.log(creditos_ordenados[i]);
        console.log("encontrados");
        console.log(creditos_encontrados);

        creditos_ordenados.push(creditos_encontrados[0]);
        creditos_para_ordenar = creditos_para_ordenar.filter(credito => !(credito == creditos_encontrados[0]));
    }

    document.querySelector(".lista_por_cobrar").append(...creditos_ordenados);
    creditos.forEach(credito => credito.classList.add("locked"));
}



document.querySelector(".btn__ordenar_recorrido").addEventListener("click", e => {
    e.preventDefault();
    ordenarRecorrido();
})
bloquear.addEventListener("click", e => {
    e.preventDefault();
    creditos.forEach(credito => credito.classList.add("locked"));
})
desbloquear.addEventListener("click", e => {
    e.preventDefault();
    creditos.forEach(credito => credito.classList.remove("locked"));
})


document.querySelector(".btn__iniciar_recorrido").addEventListener("click", async e => {
    e.preventDefault();
    const zona = new URLSearchParams(window.location.search).get("ZONA");
    let response = await cargarHandler();
    if (response.success) {
        alert(response.msg)
        // return window.location.href = `/cobrador/recorrido/${zona}`;
    }
    alert(response.msg)


})



creditos.forEach(credito => {
    let candado = credito.querySelector(".lock-icon");
    candado.addEventListener("click", e => {
        credito.classList.toggle("locked");
    });
})


