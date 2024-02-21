

const span__loading = document.querySelector(".detail--loading");
const CALLE = document.querySelector("input[name='CALLE']");
const UBICACION = document.querySelector("input[name='UBICACION']");
const form = document.querySelector("form");

CALLE.addEventListener("change", async e => {
    setLoading(true, [span__loading]);
    console.log(e.target.value);
    UBICACION.value = "";

    const raw_location = await fetch(`/api/getUbicacion`, getFetchPostBody({ CALLE: e.target.value }));
    const location = await raw_location.json();


    if (!location.error && location.ubicacion.length > 0) {
        const { LATITUD, LONGITUD } = location.ubicacion[0];
        UBICACION.value = `${LATITUD},${LONGITUD}`;
    }

    setLoading(false, [span__loading]);
})



//Valida que el DNI corresponda a la persona
form.querySelector(".button__input").addEventListener("click", async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    setLoading(true, [span__loading]);
    try {
        if (!JSON.parse(document.querySelector("#EXCEPCION_DNI").value)) {
            const razon_social = await getRazonSocialDni(form.DNI.value, form.DNI.length == 11);

            const comparacion = razon_social.toUpperCase().split(" ").map(nombre => form.NOMBRE.value.toUpperCase().split(" ").includes(nombre));
            const coincidencias = comparacion.reduce((coincidencia, acum) => acum + coincidencia, 0);

            if (coincidencias <= 1 && !confirm(`El Dni escrito es de : ${razon_social}\n no coincide con el nombre ${form.NOMBRE.value}\nCargar igualmente?`)) return;
        }
    } catch (error) {
        alert(error);
        return;
    } finally {
        setLoading(false, [span__loading]);
    }

    form.submit();

})


const handleClavo = (e, form) => {

    const OBS = prompt("Motivo del clavo");

    if (OBS == null) return e.preventDefault()

    if (!OBS.trim()) {
        e.preventDefault()
        alert("El motivo no puede estar vacio")
    }
    form.OBS.value = OBS

}







