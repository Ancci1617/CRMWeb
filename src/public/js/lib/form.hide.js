const CLASS_HIDDEN = "hidden";
const CLASS_UNSHOW = "unshow";


function ocultarFormularios() {
    document.querySelectorAll(".container").forEach(container => {
        container.classList.add(CLASS_UNSHOW);
    });
    // if (bg__black) {
    //     bg__black.classList.add(CLASS_HIDDEN);
    // }
}



function mostrarFormulario(form) {
    form.classList.remove(CLASS_UNSHOW);
    // bg__black.classList.remove(CLASS_HIDDEN);
}