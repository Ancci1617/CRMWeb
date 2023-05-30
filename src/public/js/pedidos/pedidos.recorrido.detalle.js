
const btn__vendi = document.querySelector(".btn__vendi");
const btn__cancelar = document.querySelector(".btn__cancelar");
const btn__reprogramar = document.querySelector(".btn__reprogramar");
const btn__reasignar = document.querySelector(".btn__reasignar");
const urlParams = new URLSearchParams(window.location.search);
const bg__black = document.querySelector(".bg__black");
const CLASS_HIDDEN = "hidden";
const CLASS_UNSHOW = "unshow";
const cancelar__pedido__form = document.querySelector(".cancelar__pedido__form");
const reprogramar__pedido__form = document.querySelector(".reprogramar__pedido__form");
const reasignar__pedido__form = document.querySelector(".reasignar__pedido__form");
const btn__CRM = document.querySelector(".button__CRM");

const flkty = new Flickity('.main-gallery', { contain: true });

// '{ "asNavFor": ".carousel-main", "contain": true, "pageDots": false }'


function getCteActivo() {
    return document.querySelector(".pedido.is-selected .CTE").innerText;
}
function getPedidoActivo() {
    return document.querySelector(".pedido.is-selected .pedido__ID").value;
}

function ocultarFormularios() {
    document.querySelectorAll(".container").forEach(container => {
        container.classList.add(CLASS_UNSHOW);
    });
    bg__black.classList.add(CLASS_HIDDEN);
}

function mostrarFormularios(form) {
    form.classList.remove(CLASS_UNSHOW);
    bg__black.classList.remove(CLASS_HIDDEN);
}

function setIdOnSubmit(e) {
    e.preventDefault();
    const ID = getPedidoActivo();
    const input = e.target.querySelector("input[name='ID']");
    input.value = ID;
    e.target.submit();
}


btn__reprogramar.addEventListener("click", () => {
    mostrarFormularios(reprogramar__pedido__form);
});

btn__cancelar.addEventListener("click", () => {
    mostrarFormularios(cancelar__pedido__form);
});

btn__reasignar.addEventListener("click", () => {
    mostrarFormularios(reasignar__pedido__form);
});


btn__vendi.addEventListener("click", e => {
    if (!confirm("Estas por dar como finalizado este pedido, estas seguro?")) return;
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




showPedidoByID(urlParams.get("ID"));
function showPedidoByID(ID) {

    if (!ID) return flkty.select(1);
    const pedidoById = document.querySelector(`.pedido:has(input.pedido__ID[value='${ID}'])`);
    const pedidos = [...document.querySelectorAll(`.pedido`)];
    const indice = pedidos.indexOf(pedidoById);
    flkty.select(indice);
    
}








