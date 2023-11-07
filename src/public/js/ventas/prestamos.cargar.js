const form = document.querySelector("#form_cargar_venta");
console.log("vinculado");


form.GARANTE_CTE.addEventListener("change", async cte => {
    const query_cte = await fetch(`/api/getCte?CTE=${form.GARANTE_CTE.value}`).then(res => res.json());
    const garante_elements = document.querySelectorAll('input:not([type="file"])[name*="GARANTE"]');
    console.log(query_cte);

    if (!query_cte.success) {
        garante_elements.forEach(element => element.value = '');

        form.querySelector(".garante_frente").style.background = "unset";
        form.querySelector(".garante_dorso").style.background = "unset";
        form.querySelector(".garante_frente").style.background = "unset";

        form.querySelector("input[name='FRENTE_GARANTE']").required = true;
        form.querySelector("input[name='DORSO_GARANTE']").required = true;
        form.querySelector("input[name='ROSTRO_GARANTE']").required = true;



        return alert("El numero de cliente escrito en el garante no existe");
    }
    const { CALLE, CRUCES, CRUCES2, DNI, NOMBRE, WHATSAPP: TELEFONO, ZONA } = query_cte.cte_data;
    const { frente, dorso, rostro } = query_cte.required_images;
    form.GARANTE_CALLE.value = CALLE;
    form.GARANTE_CRUCES.value = CRUCES;
    form.GARANTE_CRUCES2.value = CRUCES2;
    form.GARANTE_DNI.value = DNI;
    form.GARANTE_NOMBRE.value = NOMBRE;
    form.GARANTE_TELEFONO.value = TELEFONO;
    form.GARANTE_ZONA.value = ZONA;



    form.querySelector(".garante_frente").style.background = !frente ? "#c9efc9" : "unset";
    form.querySelector(".garante_dorso").style.background = !dorso ? "#c9efc9" : "unset";
    form.querySelector(".garante_rostro").style.background = !rostro ? "#c9efc9" : "unset";

    form.querySelector("input[name='FRENTE_GARANTE']").required = frente;
    form.querySelector("input[name='DORSO_GARANTE']").required = dorso;
    form.querySelector("input[name='ROSTRO_GARANTE']").required = rostro;



})










