//ASOCIAR INPUT-FILE CON LABEL, para appendear el nombre del archivo
const input_file_arr = document.querySelectorAll("input[type='file']")
input_file_arr.forEach(input => {
    input.addEventListener("change", e => {
        const files = e.target.files;
        const span_text = document.querySelector(`.IMG-${e.target.getAttribute("NAME")} `);
        span_text.innerText = files && files.length > 0 ? files[0].name : "Sin foto cargada..";
    })
})