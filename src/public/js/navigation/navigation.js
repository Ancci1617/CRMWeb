const burguer = document.querySelector(".burguer")

burguer.addEventListener("click",e => {
    const ul = document.querySelector(".navigation-bar ul");
    ul.classList.toggle("show")
})


