"use strict"
const coords = { x0: 0, y0: 0, x: 0, y: 0 };
//pedidos
function saveLocation(e) {
    coords.x = e.targetTouches[0].pageX;
    coords.y = e.targetTouches[0].pageY;
}


//touchcancel, cancela al ghost y boraa la clase "dragging",
pedidos.forEach(pedido => {
    pedido.addEventListener("touchcancel", e => {
        getGhostDragging().remove();
        getDragging().classList.remove("dragging");
    });
})
var ev;
//touchstart
pedidos.forEach(pedido => {


    pedido.addEventListener("touchstart", e => {
        e.preventDefault();

        saveLocation(e);
        //Si hay un A en donde hizo click, ir a link

        pedido.classList.add("dragging");

        ev = e;

        //coordenadas absolutas de la pantalla
        coords.x0 = e.targetTouches[0].pageX - window.scrollX;
        coords.y0 = e.targetTouches[0].pageY - window.scrollY;

        //Dragging fantasma Y lo a;ade al body
        const draggingCopy = pedido.cloneNode(true);
        draggingCopy.classList.add(CLASS__PEDIDO__GHOST);
        draggingCopy.style.top = e.target.getBoundingClientRect().top + window.scrollY + "px";
        draggingCopy.style.left = e.target.getBoundingClientRect().left + window.scrollX + "px";
        document.body.appendChild(draggingCopy);

    })
})

//touchmove + save coords
pedidos.forEach(pedido => {
    pedido.addEventListener("touchmove", e => {
        saveLocation(e);
        const dragging = e.target;
        console.log("move");
        const draggingCopy = getGhostDragging();
        draggingCopy.style.left = dragging.getBoundingClientRect().left + coords.x - coords.x0 + "px"
        draggingCopy.style.top = dragging.getBoundingClientRect().top + coords.y - coords.y0 + "px"

    })
})



pedidos.forEach(pedido => {
    pedido.addEventListener("touchend", e => {
        getGhostDragging().remove();
        const dragging = getDragging();
        dragging.classList.remove("dragging");


        //Si el click, fue hecho en el mismo lugar clickea el A que halla en ese punto 
        var elements_from_point = [...document.elementsFromPoint(coords.x - window.scrollX, coords.y - window.scrollY)];
        var a_from_point = elements_from_point.filter(element => element.tagName == "A");
        console.log("a", a_from_point);
        if (a_from_point.length > 0 && coords.x0 == coords.x && (coords.y - window.scrollY) == coords.y0) {
            a_from_point[0].click();
        }




        //toggle inactivo/activo
        if (elements_from_point.includes(pedidos__activos) && dragging.classList.contains(CLASS_INACTIVO)) {

            const orders = [...pedidos__activos.querySelectorAll(".pedido")].map(
                pedido => parseInt(window.getComputedStyle(pedido).getPropertyValue("order"))
            );
            const max_order = Math.max(...orders);
            pedidos__activos.appendChild(dragging);
            dragging.classList.remove(CLASS_INACTIVO);
            dragging.classList.add(CLASS_ACTIVO);
            dragging.style.order = max_order + 10;

        } else if (elements_from_point.includes(pedidos__pendientes) && dragging.classList.contains(CLASS_ACTIVO)) {

            pedidos__pendientes.appendChild(dragging);
            dragging.classList.remove(CLASS_ACTIVO);
            dragging.classList.add(CLASS_INACTIVO);
            dragging.style.order = null;

        }

        //Si, se solto sobre un pedido, target = 'el pedido' || return
        const target = elements_from_point.filter(filtro => {
            return filtro.classList.contains(CLASS_PEDIDO);
        })[0]
        if (!target) return

        let orderDragging = parseInt(window.getComputedStyle(dragging).getPropertyValue("order"));
        let orderTarget = parseInt(window.getComputedStyle(target).getPropertyValue("order"));

        pedidos.forEach(pedido => {

            let orderItem = parseInt(window.getComputedStyle(pedido).getPropertyValue("order"));
            if (orderItem < orderDragging && orderItem > orderTarget) (orderItem += 10);
            if (orderItem > orderDragging && orderItem < orderTarget) (orderItem -= 10);
            pedido.style.order = orderItem;

        });


        if (orderDragging > orderTarget) {
            orderDragging = orderTarget;
            orderTarget += 10;
        } else if (orderDragging < orderTarget) {
            orderDragging = orderTarget;
            orderTarget -= 10;
        }

        dragging.style.order = orderDragging;
        target.style.order = orderTarget;
    })
})
