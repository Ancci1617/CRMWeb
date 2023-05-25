

let a_arr = [...document.querySelectorAll(".pedido a")];
const btn = document.querySelector(".btn-cargar-cambios");

function submitDataOnInputs() {
    //El input order de todos los pedidos activos = su orden
    //EL input ESTADO de todos los pedidos es igual a su clase ACTIVO O INACTIVO
    pedidos.forEach(pedido => {

        if (pedido.classList.contains(CLASS_ACTIVO)) {

            pedido.querySelector(".input__order").value = window.getComputedStyle(pedido).getPropertyValue("order");
            pedido.querySelector(".input__estado").value = "ACTIVO";

        } else if (pedido.classList.contains(CLASS_INACTIVO)) {

            pedido.querySelector(".input__order").value = 0;
            pedido.querySelector(".input__estado").value = "PENDIENTE";
        }
    })

    const data = new FormData(form__submit);
    console.log("data",data);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/pedidos/recorrido/cargar_orden");
    xhr.send(data);


}


a_arr.forEach(link => link.addEventListener("click", e => {
    submitDataOnInputs();
}));







