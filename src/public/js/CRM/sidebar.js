const lengueta = document.querySelector(".sidebar-lengueta");
const sidebar = document.querySelector(".sidebar")

lengueta.addEventListener("click", e => {
    let span_lengueta = e.target;
    sidebar.classList.toggle("unshow");
    
    if(span_lengueta.innerText == "Ocultar domicilio"){
        span_lengueta.innerText = "Mostrar domicilio";
        return;
    }
    
    span_lengueta.innerText = "Ocultar domicilio";
    

})