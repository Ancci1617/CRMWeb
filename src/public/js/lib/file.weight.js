const input_file = document.querySelectorAll("input[type='file']");

input_file.forEach(input =>{
    input.addEventListener("change",e=> {
        const maxSize = 8 * 1024 * 1024;
        if (input.files  &&  input.files.length > 0 && input.files[0].size > maxSize) {
            input.setCustomValidity("El archivo es demasiado pesado");
            input.reportValidity();
            input.value = '';
            return;
        }
        input.setCustomValidity("");
    })
})












