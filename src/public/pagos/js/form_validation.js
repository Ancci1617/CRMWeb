const btn_cambiar_fecha = document.querySelector(".btn-cambiar-fecha");
const btn_submit = document.querySelectorAll("input[type='submit']");











btn_submit.forEach(btn => {
    btn.addEventListener("click", e => {
        const input_cobrado = btn.form.querySelector("input[name='COBRADO']");
        const fecha_cob = btn.form.querySelector("input[name='FECHA_COB']");
        if(btn.getAttribute("formaction").includes(actions.CAMBIO_DE_FECHA))
            return input_cobrado.required = false;
        return input_cobrado.required = true;
    });

});
