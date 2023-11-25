


const CALLE = document.querySelector("input[name='CALLE']");
const UBICACION = document.querySelector("input[name='UBICACION']");



CALLE.addEventListener("change", async e => {
    setLoading(true);
    console.log(e.target.value);
    UBICACION.value = "";

    const raw_location = await fetch(`/api/getUbicacion`, getFetchPostBody({ CALLE : e.target.value}));
    const location = await raw_location.json();
    console.log(location)

    if(!location.error && location.ubicacion.length > 0){
        const {LATITUD,LONGITUD} = location.ubicacion[0];
        UBICACION.value = `${LATITUD},${LONGITUD}`;
    }



    setLoading(false);
})









