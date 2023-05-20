
const btn__vendi = document.querySelector(".btn__vendi");

function getPedidoActivo(){
    return document.querySelector(".pedido__ID").innerHTML;
}

btn__vendi.addEventListener("click", e => {
    const ID = getPedidoActivo();
    const link = document.createElement("a");
    link.href = `/pedidos/pedido_vendi/${ID}`;
    link.click();



});




















// console.log("conectado");

// var slideIndex = 1;
// showDivs(slideIndex);

// function plusDivs(n) {
//     showDivs(slideIndex += n);
// }

// function showDivs(n) {
//     var i;
//     var my_slides = document.getElementsByClassName("pedido__slide");
   
//     if (n > my_slides.length) { slideIndex = 1 }
//     if (n < 1) { slideIndex = my_slides.length }

//     for (i = 0; i < my_slides.length; i++) {
//         my_slides[i].style.display = "none";
//     }

//     my_slides[slideIndex - 1].style.display = "block";
// }

