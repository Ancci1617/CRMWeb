
const btn__vendi = document.querySelector(".btn__vendi");
const btn__cancelar = document.querySelector(".btn__cancelar");
const btn__reprogramar = document.querySelector(".btn__reprogramar");
const btn__reasignar = document.querySelector(".btn__reasignar");


const bg__black = document.querySelector(".bg__black");
const CLASS_HIDDEN = "hidden"; 
const CLASS_UNSHOW = "unshow";
const cancelar__pedido__form = document.querySelector(".cancelar__pedido__form");
const reprogramar__pedido__form = document.querySelector(".reprogramar__pedido__form");
const reasignar__pedido__form = document.querySelector(".reasignar__pedido__form");
const btn__CRM = document.querySelector(".button__CRM");


function getCteActivo(){
    return document.querySelectorAll(".pedido:not(.hidden) span.CTE")[0].innerText
}
function getPedidoActivo(){
    return document.querySelector(".pedido__slide:not(.hidden) .pedido__ID").innerText;
}

function ocultarFormularios(){
    document.querySelectorAll(".container").forEach(container => {
        container.classList.add(CLASS_UNSHOW);
    });
    bg__black.classList.add(CLASS_HIDDEN);
}

function mostrarFormularios(form){
    form.classList.remove(CLASS_UNSHOW);
    bg__black.classList.remove(CLASS_HIDDEN);
}
//PRE SUBMIT
function setIdOnSubmit(e){
    e.preventDefault();
    const ID = getPedidoActivo();
    const input = e.target.querySelector("input[name='ID']");
    input.value = ID;
    e.target.submit();
}















btn__reprogramar.addEventListener("click", () =>{
    mostrarFormularios(reprogramar__pedido__form);
});

btn__cancelar.addEventListener("click", () => {
    mostrarFormularios(cancelar__pedido__form);
});

btn__reasignar.addEventListener("click", () => {
    mostrarFormularios(reasignar__pedido__form);
});


btn__vendi.addEventListener("click", e => {
    if(!confirm("Estas por dar como finalizado este pedido, estas seguro?")) return ;
    const ID = getPedidoActivo();
    const link = document.createElement("a");
    link.href = `/pedidos/pedido_vendi/${ID}`;
    link.click();
});

btn__CRM.addEventListener("click", e => {
    const link = document.createElement("a");
    link.href = `/CRM?CTE=${getCteActivo()}`;
    link.click();
});

cancelar__pedido__form.addEventListener("submit", setIdOnSubmit);
reprogramar__pedido__form.addEventListener("submit", setIdOnSubmit);
reasignar__pedido__form.addEventListener("submit", setIdOnSubmit);






//SLIDE

var slideIndex = 1;
function showSlide(slide_index_to_show) {
    const pedidos_slide = [...document.getElementsByClassName("pedido__slide")];
   
    if (slide_index_to_show > pedidos_slide.length) { slideIndex = 1 }
    if (slide_index_to_show < 1) { slideIndex = pedidos_slide.length }

    pedidos_slide.forEach(pedido => {
        pedido.classList.add(CLASS_HIDDEN);
        pedido.classList.remove("pedido_vigente");
    });
    pedidos_slide[slideIndex - 1].classList.add("pedido_vigente")    
    pedidos_slide[slideIndex - 1].classList.remove(CLASS_HIDDEN);

}

showSlide(slideIndex);

function plusDivs(n) {
    showSlide(slideIndex += n);
}










