const pedidos = document.querySelectorAll(".pedido");
const pedidos__pendientes = document.querySelector(".pedidos__pendientes");
const pedidos__activos = document.querySelector(".pedidos__activos");
const form__submit = document.querySelector(".pedidos__main__container");

const CLASS_INACTIVO = "pedido__inactivo";
const CLASS_PEDIDO = "pedido";
const CLASS_ACTIVO = "pedido__activo";
const CLASS__PEDIDO__GHOST = "pedido__ghost";


function getDragging() {
    return document.querySelector(".dragging");
}
function getGhostDragging() {
    return document.querySelector("." + CLASS__PEDIDO__GHOST);
}
function changeOrder(pedido, newOrder) {
    pedido.style.order = newOrder;
}


pedidos.forEach(pedido => {
    pedido.addEventListener("dragstart", () => {
        pedido.classList.add("dragging");
    });
    pedido.addEventListener("dragend", () => {
        pedido.classList.remove("dragging");
    });
});

//Si un pedido inactivo entra en la hoja de pedidos__activos__container
//el pedido toma la clase de activo, y se "append" en activos__container
//con el mayor numero de orden + 10
pedidos__activos.addEventListener("dragenter", e => {
    const dragging = getDragging();
    if (dragging.classList.contains(CLASS_INACTIVO)) {

        //get max Order
        const orders = [...pedidos__activos.querySelectorAll(".pedido")].map(
            pedido => parseInt(window.getComputedStyle(pedido).getPropertyValue("order"))
        );

        const max_order = Math.max(...orders);
        pedidos__activos.appendChild(dragging);
        dragging.classList.remove(CLASS_INACTIVO);
        dragging.classList.add(CLASS_ACTIVO);

        //Cambia el orden
        changeOrder(dragging, max_order + 10);
    }
});

pedidos__pendientes.addEventListener("dragenter", e => {
    const dragging = getDragging();
    if (dragging.classList.contains(CLASS_ACTIVO)) {

        pedidos__pendientes.appendChild(dragging);
        dragging.classList.remove(CLASS_ACTIVO);
        dragging.classList.add(CLASS_INACTIVO);
        changeOrder(dragging, null)
    }
});




pedidos.forEach(pedido => {
    pedido.addEventListener("dragenter", e => {
        if (!e.target.classList.contains("pedido")) return;

        const dragging = getDragging();

        let orderDragging = parseInt(window.getComputedStyle(dragging).getPropertyValue("order"));
        let orderTarget = parseInt(window.getComputedStyle(e.target).getPropertyValue("order"));

        //por cada elemento reestrablece el orden
        pedidos.forEach(pedido_actualizar => {

            let orderItem = parseInt(window.getComputedStyle(pedido_actualizar).getPropertyValue("order"));

            if (orderItem < orderDragging && orderItem > orderTarget) (orderItem += 10);
            if (orderItem > orderDragging && orderItem < orderTarget) (orderItem -= 10);

            changeOrder(pedido_actualizar, orderItem);

        })

        if (orderDragging > orderTarget) {

            orderDragging = orderTarget;
            orderTarget += 10;

        } else if (orderDragging < orderTarget) {

            orderDragging = orderTarget;
            orderTarget -= 10;

        }

        changeOrder(dragging, orderDragging);
        changeOrder(e.target, orderTarget);

    });
})





form__submit.addEventListener("submit", e => {
    //El input order de todos los pedidos activos = su orden
    //EL input ESTADO de todos los pedidos es igual a su clase ACTIVO O INACTIVO
    e.preventDefault();

    pedidos.forEach(pedido => {

        if (pedido.classList.contains(CLASS_ACTIVO)) {
            
            pedido.querySelector(".input__order").value = window.getComputedStyle(pedido).getPropertyValue("order");
            pedido.querySelector(".input__estado").value = "ACTIVO";

        } else if (pedido.classList.contains(CLASS_INACTIVO)) {
        
            pedido.querySelector(".input__order").value = null;
            pedido.querySelector(".input__estado").value = "PENDIENTE";
        
        }

    })


    form__submit.submit();



});