const grupos = document.querySelectorAll(".grupo");
const buscador = document.querySelector(".buscador");


function actualizarTotales(){
    grupos.forEach(grupo => {
        const cantidad = grupo.querySelectorAll(".grupo__data:not(.hidden)").length;
        grupo.querySelector(".detalle").innerText = `Total : (${cantidad})`;
    });
}

buscador.addEventListener("change", e => {
    const data = e.target.value;
    
    grupos.forEach(grupo => {
        const grupos__data = grupo.querySelectorAll(".grupo__data");

        grupos__data.forEach(grupo__data => {
            
            if (!grupo__data.innerHTML.includes(data)) {
                grupo__data.classList.add("hidden");
            } else {
                grupo__data.classList.remove("hidden");
            }

        });



    });

    buscador.innerHTML.includes(data);
    actualizarTotales();
});

//En cada grupo, le agrega un listener click en title
grupos.forEach(grupo => {
    grupo.querySelector(".grupo__title").addEventListener("click", e => {
        const inner_Data__container = grupo.querySelector(".data__container");
        inner_Data__container.classList.toggle("hidden");
    });
});

















