"use strict";
const btn_nuevo = document.querySelector(".btn-nuevo");
const btn_submit = document.querySelector(".button input");
const form = document.querySelector("form");
const articulos = document.getElementsByName("ARTICULOS")[0];
const cuotas = form.CUOTAS;
const cuota = document.getElementsByName("CUOTA")[0];
const estatus_options = document.querySelector(".options-estatus");
const CTE = document.getElementsByName("CTE")[0].value;
const evaluation_data = { sabana: 0, master: 0, prepagos: { 9: "", 12: "" } };
const ANTICIPO_MP = document.getElementsByName("ANTICIPO_MP")[0];
const ANTICIPO_MP_CONTAINER = document.querySelector(".select_anticipo_container");
const ANTICIPO = document.getElementsByName("ANTICIPO")[0];
const ubicacion_cliente = document.querySelector("input[name='ubicacion_cliente']");
const detail_primer_vencimiento = document.querySelector(".detail_primer_vencimiento");
const zonas_sin_servicio_cobranza = ["T3", "T4", "P1", "P2", "D6", "D7", "D8"];


const getServicio = (valor) => {
    if (valor <= 10000) return 1000;
    if (valor <= 20000) return 2000;
    if (valor <= 30000) return 3000;
    if (valor <= 40000) return 4000;
    return 5000;
}
const handleServicioDeCobranza = () => {

    const servicio = zonas_sin_servicio_cobranza.includes(form.ZONA.value) ? Math.max(getServicio(cuota.value), 1000) : getServicio(cuota.value);
    form.SERV_UNIT.value = servicio;

}


const cualEsPrimerVencimiento = (PRIMER_PAGO, dia) => {
    const dia_mill = (1000 * 60 * 60 * 24);

    const fechas = {
        anterior: {
            fecha: new Date(new Date(PRIMER_PAGO).setUTCMonth(PRIMER_PAGO.getUTCMonth() - 1, dia)),
            difDias: 0
        },
        vigente: {
            fecha: new Date(new Date(PRIMER_PAGO).setUTCMonth(PRIMER_PAGO.getUTCMonth(), dia)),
            difDias: 0
        },
        proximo: {
            fecha: new Date(new Date(PRIMER_PAGO).setUTCMonth(PRIMER_PAGO.getUTCMonth() + 1, dia)),
            difDias: 0
        }
    }
    fechas.anterior.difDias = Math.floor((new Date(fechas.anterior.fecha).setUTCMonth(fechas.anterior.fecha.getUTCMonth() + 1) - PRIMER_PAGO) / dia_mill)
    fechas.vigente.difDias = Math.floor((new Date(fechas.vigente.fecha).setUTCMonth(fechas.vigente.fecha.getUTCMonth() + 1) - PRIMER_PAGO) / dia_mill)
    fechas.proximo.difDias = Math.floor((new Date(fechas.proximo.fecha).setUTCMonth(fechas.proximo.fecha.getUTCMonth() + 1) - PRIMER_PAGO) / dia_mill)

    if (fechas.anterior.difDias <= 40 && fechas.anterior.difDias >= 9) {
        return fechas.anterior.fecha;
    }

    if (fechas.vigente.difDias <= 40 && fechas.vigente.difDias >= 9) {
        return fechas.vigente.fecha;
    }

    return fechas.proximo.fecha;


}

const handlePrimerVencimiento = e => {
    const primer_vencimiento = cualEsPrimerVencimiento(new Date(form.PRIMER_PAGO.value), form.VENCIMIENTO.value);
    form.PRIMER_VENCIMIENTO.value = primer_vencimiento.toISOString().split("T")[0];


    primer_vencimiento.setUTCMonth(primer_vencimiento.getUTCMonth() + 1);
    const string_aux = primer_vencimiento.toISOString().split("T")[0];
    detail_primer_vencimiento.innerText =
        `(${string_aux.split("-")[2]}/${string_aux.split("-")[1]})`

};

form.PRIMER_PAGO.addEventListener("change", handlePrimerVencimiento);
form.VENCIMIENTO.addEventListener("change", handlePrimerVencimiento);

ANTICIPO.addEventListener("change", e => {

    if (e.target.value > 0) {
        ANTICIPO_MP.required = true;
        ANTICIPO_MP_CONTAINER.hidden = false;
        return;
    }
    ANTICIPO_MP.required = false;
    ANTICIPO_MP.selectedIndex = 0;
    ANTICIPO_MP_CONTAINER.hidden = true;

})



window.addEventListener("load", async e => {
    cargarUbicacion();


    [{ CUOTAS_6: evaluation_data.sabana }] = await fetchPost("/ventas/precios",  { articulos: ["36"] } );
    evaluation_data.master = await fetchPost(`/api/getDisponible/${CTE}`,form.FICHA.value ? {EXCEPCIONES : [form.FICHA.value]} : undefined);
    console.log(evaluation_data.master);
    evaluation_data.prepagos["9"] = await fetchPost("/query_prepago_entrega", { calificacion: evaluation_data.master.CALIF, cuotas: 9 });
    evaluation_data.prepagos["12"] = await fetchPost("/query_prepago_entrega", { calificacion: evaluation_data.master.CALIF, cuotas: 12 });

});

async function autoCompletarPrecios() {
    //Consulta http al servidor para conocer los precios de un articulo
    const COLS = {
        1: "CONTADO",
        3: "CUOTAS_3",
        6: "CUOTAS_6",
        9: "CUOTAS_9",
    }
    const { TOTAL, CUOTAS: { value: CUOTAS }, CUOTA, ANTICIPO_PREPAGO, ESTATUS } = form;
    const articulos = form.ARTICULOS.value.trim().split(" ");
    const query = { articulos };

    const precios = await fetchPost("/ventas/precios", query);

    let cuota = 0;
    let anticipo = 0;

    for (const art of articulos) {
        const precio = precios.find(precio => precio.Art == art);
        if (!precio) {
            CUOTA.value = `Articulo ${art} no encontrado.`
            TOTAL.value = ""
            form.SERV_UNIT.selectedIndex = 0
            return
        }
        anticipo += precio.ANTICIPO
        cuota += precio[COLS[CUOTAS]] / CUOTAS;
    }

    TOTAL.value = (cuota * CUOTAS) + anticipo;
    CUOTA.value = cuota;


    const cuotasParaEntrega = document.querySelector(".cuotas_para_entrega");
    const anticipoParaEntrega = document.querySelector(".anticipo_para_entrega");
    showAndResetElement(cuotasParaEntrega, !!anticipo)
    showAndResetElement(anticipoParaEntrega, !!anticipo)
    form.ESTATUS.value = anticipo ? "Prepago" : "Entregado"
    form.ANTICIPO_PREPAGO.value = anticipo



    handleServicioDeCobranza();
}

function ventaAprobada(responsable, Estatus, cuotas_para_entrega = 0, vendido, anticipo) {
    //TODO ESTE BLOQUE DE CODIGO TRANSFORMALO EN EL JSON DEL FORM
    //Transformar esto a consulta SQL
    const { sabana, master } = evaluation_data;

    //Genera el disponible en funcion de su calificaicon O BIEN, si tiene disponible
    let disponible;
    if (master.BGM == "REVISAR" || master.BGM == "ATRASADO") {
        disponible = 0;
    } else if (master.BGM == "BLOQUEADO") {
        disponible = -1;
    } else {
        disponible = master.BGM;
    }


    //Si el vendedor se hacer cargo esta aprobada
    if (responsable == "SI") return true;

    //Si es prepago solo hace evaluacion de la cuotas de entrega
    if (Estatus === 'Prepago') {

        const cuotas = document.getElementsByName("CUOTAS")[0].value;
        const cuotas_entrega = evaluation_data.prepagos[cuotas];
        if (cuotas_para_entrega >= cuotas_entrega?.ENTREGA) return true;
        return false;

    }


    //AUMENTA EL DISPONIBLE, Si es con anticipo
    if (anticipo >= cuota.value || Estatus.includes("Con anticipo")) disponible += 1;

    //Chequea si le da el disponible
    if (vendido / sabana <= disponible) return true;


    //Si no se cumplen las condiciones desaprobada 
    return false;

}

function showAndResetElement(container, show) {
    const input = container.querySelector("input");
    input.value = "";
    show ? container.classList.remove("hidden") : container.classList.add("hidden");
    show ? input.setAttribute("required", "") : input.removeAttribute("required");
}
function handleShowPrepagoOptions(e) {


    const cuotasParaEntrega = document.querySelector(".cuotas_para_entrega");
    const anticipoParaEntrega = document.querySelector(".anticipo_para_entrega");
    showAndResetElement(cuotasParaEntrega, e.target.value == "Prepago")
    showAndResetElement(anticipoParaEntrega, e.target.value == "Prepago")

}
estatus_options.addEventListener("change", handleShowPrepagoOptions);




//EVALUACION DE LA VENTA
btn_submit.addEventListener("click", async e => {
    e.preventDefault();

    if (!form.LATITUD_VENDEDOR.value || !form.LONGITUD_VENDEDOR.value || !form.ACCURACY_VENDEDOR.value) {
        setLoading(true)
        await cargarUbicacion();
        setLoading(false)
    }


    if (!form.reportValidity()) return;

    handlePrimerVencimiento();

    const { isSamePerson } = await handleDniNombre();
    if (!isSamePerson) return;

    const { RESPONSABLE, ESTATUS, CUOTAS_PARA_ENTREGA, TOTAL, ANTICIPO } = form;
    const aprobado = document.getElementsByName("APROBADO")[0];
    aprobado.value = "APROBADO";
    const isAprobado = ventaAprobada(RESPONSABLE.value, ESTATUS.value, CUOTAS_PARA_ENTREGA.value, TOTAL.value, ANTICIPO.value);

    if (isAprobado)
        return form.submit()

    if (confirm("La venta esta DESAPROBADA, ¿cargar igualmente?")) {
        aprobado.value = "DESAPROBADO";
        return form.submit()
    }


});


//AutoCompletado de los precios
articulos.addEventListener("change", autoCompletarPrecios);

document.querySelector(".selector-cuotas").addEventListener("change", e => autoCompletarPrecios())

cuota.addEventListener("input", handleServicioDeCobranza);
form.ZONA.addEventListener("input", handleServicioDeCobranza);
ubicacion_cliente.addEventListener("keyup", e => {
    ubicacion_cliente.value = ubicacion_cliente.value.replaceAll(" ", "")
});





const cargarUbicacion = async () => {

    try {
        const { coords } = await getLocation();
        const { latitude, longitude, accuracy } = coords;
        document.querySelector("input[name='LATITUD_VENDEDOR']").value = latitude;
        document.querySelector("input[name='LONGITUD_VENDEDOR']").value = longitude;
        document.querySelector("input[name='ACCURACY_VENDEDOR']").value = accuracy;

    } catch (error) {
        if (error.code == 1) {
            alert("No se puede cargar la venta, la ubicacion se encuentra desabilitada.");
            return location.href = "/crm"
        }
        console.log("Error desconocido", error);
        alert(`Error desconocido ${error}, CODE ${error.code} `);
    }


}

const compareDni = async (dni, nombre) => {
    setLoading(true);
    try {
        if (JSON.parse(document.querySelector("#evaluar_dni").value)) return { isSamePerson: true }

        const razon_social = await getRazonSocialDni(dni, dni.length == 11);
        const comparacion = razon_social.toUpperCase().split(" ").map(name_split => nombre.toUpperCase().split(" ").includes(name_split));
        const coincidencias = comparacion.reduce((coincidencia, acum) => acum + coincidencia, 0);

        return { isSamePerson: coincidencias >= 2, razon_social, coincidencias }

    } catch (error) {
        throw new Error(error);
    } finally {
        setLoading(false);
    }
}
const handleDniNombre = async () => {

    try {
        if (!form.DNI.value || !form.NOMBRE.value) return;
        const { isSamePerson, razon_social } = await compareDni(form.DNI.value, form.NOMBRE.value);
        if (!isSamePerson) alert(`El Dni declarado pertenece a ${razon_social} \nNo coincide con el nombre ${form.NOMBRE.value}`)
        return { isSamePerson }
    } catch (error) {
        alert(error);
    }

}

form.DNI.addEventListener("change", handleDniNombre);
form.NOMBRE.addEventListener("change", handleDniNombre);


