const form__container = document.querySelector(".container");
const domicilios = document.querySelectorAll(".domicilio_card");


domicilios.forEach(domicilio => {
    domicilio.addEventListener("click", e => {

        if(e.target.tagName == 'A') return;

        mostrarFormulario(form__container);
        const ID = domicilio.querySelector(".ID").innerText;
        document.querySelector("input[name='ID']").value = ID;
        
    }); 
});





