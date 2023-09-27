




const cargarHandler = async () => {

    const creditos = [...document.querySelectorAll(".credito_por_cobrar")]
    const body = creditos.reduce((acumulado, credito, indice) => {
        return [...acumulado, { ORDEN_COBRANZA: indice, ID: credito.querySelector("input[name='ID']").value }]
    }, [])

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

}

const ordenarRecorrido = () => {
    let creditos_para_ordenar = [...document.querySelectorAll(".credito_por_cobrar")].filter(credito => !credito.querySelector("input[value=''][name='LATITUD']"));

    let creditos_ordenados = [creditos_para_ordenar[0]];
    for (let i = 0; (i < creditos_ordenados.length && creditos_para_ordenar.length > 0); i++) {

        let latitud_inicial = parseFloat(creditos_ordenados[i].querySelector("input[name='LATITUD']").value);
        let longitud_inicial = parseFloat(creditos_ordenados[i].querySelector("input[name='LONGITUD']").value);

        console.log("inicial", { latitud_inicial, longitud_inicial });

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

    console.log("ordenados");
    console.log(creditos_ordenados);
    document.querySelector(".lista_por_cobrar").append(...creditos_ordenados);

}



document.querySelector(".btn__cargar_recorrido").addEventListener("click",e => {

    e.preventDefault();
    ordenarRecorrido();

})



