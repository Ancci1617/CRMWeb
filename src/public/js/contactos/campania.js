const contacto_activo_ID = "";
const CLASS_HIDDEN = "hidden";
const CLASS_UNSHOW = "unshow";
const form__container = document.querySelector(".container");
const contactos = document.querySelectorAll(".contacto");
const bg__black = document.querySelector(".bg__black");

function mostrarFormularios() {
    form__container.classList.remove(CLASS_UNSHOW);
    bg__black.classList.remove(CLASS_HIDDEN);
}

function ocultarFormularios() {
    form__container.classList.add(CLASS_UNSHOW);
    bg__black.classList.add(CLASS_HIDDEN);
}


contactos.forEach(contacto => {
    contacto.addEventListener("click", e => {

        if(e.target.tagName == 'A') return;

        mostrarFormularios();

        const ID = contacto.querySelector(".ID").innerText;
        document.querySelector("input[name='ID']").value = ID;

    });
})





