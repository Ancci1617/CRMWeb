
const btn__copiar = document.querySelector("btn-copiar");



document.querySelector(".NOMBRE").addEventListener("click",e=> {
    navigator.clipboard.writeText(e.target.innerText)
    
})



