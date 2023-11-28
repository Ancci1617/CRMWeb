


const groups = document.querySelectorAll(".detail_group")

groups.forEach(group => {
    const data = group.querySelector(".data");

    group.addEventListener("click", e => {
        data.classList.toggle("hidden")

    })
})


//Mostrar y ocultar detalles de los pagos
const creditos = document.querySelectorAll(".credito");
creditos.forEach(credito => {
    const container__pagos = credito.querySelector(".container--pagos");
    const btn_detalles = credito.querySelector(".btn-detalles");

    btn_detalles.addEventListener("click", e => {
        document.querySelectorAll(".container--pagos").forEach(container => container.classList.add("unshow"));
        container__pagos.classList.remove("unshow");
    });
    container__pagos.querySelector(".container--pagos__header__close").addEventListener("click", e => {
        container__pagos.classList.add("unshow");
    });
})






















