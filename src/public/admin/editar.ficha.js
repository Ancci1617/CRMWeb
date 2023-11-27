
const form = document.querySelector("form")

form.addEventListener("submit", e => {
    const { TOTAL : {value : TOTAL}, CUOTA : {value : CUOTA} } = e.target;

    if (parseInt(TOTAL) % parseInt(CUOTA) != 0) {
        e.preventDefault();
        alert("El total no es divisible por las cuotas..")
    }


})







