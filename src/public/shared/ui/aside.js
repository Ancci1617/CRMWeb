const li_fechas = document.querySelectorAll(".li__fecha");
const SHOW_LI_CLASS = "show_aside_li__fecha";

const asideLeft = document.querySelector(".aside")
const btnMostrarAside = document.querySelector(".btn--mostrar-aside")
const btnCerrarAside = document.querySelector(".aside .btn--cerrar-aside")

li_fechas.forEach(li => {
    li.addEventListener("click", e => {
        li.classList.toggle(SHOW_LI_CLASS);
    })
})

const toggleShowAside = () => {
    asideLeft.classList.toggle("show_aside")
}

btnMostrarAside.addEventListener("click", toggleShowAside)
btnCerrarAside.addEventListener("click", toggleShowAside)












