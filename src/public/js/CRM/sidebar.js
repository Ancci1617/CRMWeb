const lengueta = document.querySelector(".sidebar-lengueta");
const sidebar = document.querySelector(".sidebar")

lengueta.addEventListener("click", e => {
    console.log(e.target);
    let span_lengueta = lengueta.querySelector("span");
    sidebar.classList.toggle("unshow");

    if (span_lengueta.innerText == "Ocultar domicilio") {
        span_lengueta.innerText = "Mostrar domicilio";
        return;
    }

    span_lengueta.innerText = "Ocultar domicilio";


})



const handleClickOnFamiliar = (e) => {
    const cte = e.target.innerText
    lengueta.click()
    evaluarCliente(cte)
}
const setAsideEventsListeners = () => {

    const ctesEnDomicilio = [...document.querySelectorAll(".tabla-domicilio td:nth-child(3)")]
    ctesEnDomicilio.forEach(cte => cte.addEventListener("click", handleClickOnFamiliar))
}


