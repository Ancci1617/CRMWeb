


const groups = document.querySelectorAll(".detail_group")

groups.forEach(group => {
    const data = group.querySelector(".data");

    group.addEventListener("click", e => {
        data.classList.toggle("hidden")

    })
})
























