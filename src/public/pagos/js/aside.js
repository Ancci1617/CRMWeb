const li_fechas = document.querySelectorAll(".li__fecha");
const SHOW_LI_CLASS = "show_aside_li__fecha";

li_fechas.forEach(li => {
    li.addEventListener("click", e => {
        li.classList.toggle(SHOW_LI_CLASS);
    })
})














