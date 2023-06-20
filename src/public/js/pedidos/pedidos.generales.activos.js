const grupos = document.querySelectorAll(".grupo");
const buscador = document.querySelector(".buscador");


function actualizarTotales() {
    grupos.forEach(grupo => {
        const cantidad = grupo.querySelectorAll(".grupo__data:not(.hidden)").length;
        grupo.querySelector(".detalle").innerText = `Total: (${cantidad})`;
    });
}

buscador.addEventListener("change", e => {
    const data = e.target.value.toUpperCase();
    const grupos_data = document.querySelectorAll(".grupo__data");
    
    grupos_data.forEach(grupo__data => {

        if (!grupo__data.innerHTML.toUpperCase().includes(data))
            return grupo__data.classList.add("hidden");
        grupo__data.classList.remove("hidden");
    });

    actualizarTotales();
});

//En cada grupo, le agrega un listener click en title
grupos.forEach(grupo => {
    grupo.querySelector(".grupo__title").addEventListener("click", e => {
        const data__container = grupo.querySelector(".data__container");
        data__container.classList.toggle("appear");
        data__container.classList.toggle("hidden");
    });
});

















