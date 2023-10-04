const creditos = document.querySelectorAll(".credito_por_cobrar");
const split = location.pathname.split("/");
ZONA = split[split.length-1];

creditos.forEach(credito => {
    const details = credito.querySelector(".details");
    details.addEventListener("click",e => {
        const FICHA = credito.querySelector("input[name='FICHA']").value;
        let a = document.createElement("a");
        a.href = `/pagos/deuda_credito?CREDITO=${FICHA}`;
        a.click();
    },true)
})



