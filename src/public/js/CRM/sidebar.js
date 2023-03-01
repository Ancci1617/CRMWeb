const lengueta = document.querySelector(".sidebar-lengueta");
const sidebar = document.querySelector(".sidebar")

lengueta.addEventListener("click", e => {
    let span_lengueta = e.target;

    if(span_lengueta.innerText == "Ocultar domicilio"){
        span_lengueta.innerText = "Mostrar domicilio";
        sidebar.style.transform = "translate(calc(50vw))";
        return;
    }

    span_lengueta.innerText = "Ocultar domicilio";
    sidebar.style.transform = "translate(0)"
    

})