const btn_cambiar_fecha = document.querySelector(".btn-cambiar-fecha");
const btn_submit = document.querySelectorAll("input[type='submit']");

const creditos_arr = document.querySelectorAll(".credito");
const check_mp = document.getElementsByName("ISMP")


creditos_arr.forEach(credito => {
    const btn_submit = [...credito.querySelectorAll("input[type='submit']")];
    const btn_mostrar_detalle = credito.querySelector(".btn-detalles");
    const btn_ocultar_detalle = credito.querySelector(".btn-cerrar-detalle");
    const deep_details = credito.querySelector(".deep_details");

    btn_mostrar_detalle.addEventListener("click", e => {
        deep_details.classList.toggle("show");
    }, false);
    btn_ocultar_detalle.addEventListener("click", e => {
        deep_details.classList.toggle("show");
    }, false);

    credito.querySelector(".check_mp").addEventListener("click",e => {
        const MP_INPUTS = credito.querySelectorAll("input[name='N_OPERACION'],input[name='MP_PORCENTAJE'],select[name='MP_TITULAR']");
        MP_INPUTS.forEach(input => {
            input.required = e.target.checked;
            input.hidden = !e.target.checked;
            input.value = "";
        })

    });



    btn_submit.find(element => element.formAction.includes("cambiarFecha"))?.addEventListener("click", e => {
        credito.COBRADO.required = false;
        credito.FECHA_COB.required = true;
        return
    })
    btn_submit.find(element => element.formAction.includes("cargar_pago"))?.addEventListener("click", e => {
        credito.COBRADO.required = true;
        credito.FECHA_COB.required = false;
        return
    })
})

// btn_submit.forEach(btn => {
//     btn.addEventListener("click", e => {
//         const input_cobrado = btn.form.querySelector("input[name='COBRADO']");
//         const fecha_cob = btn.form.querySelector("input[name='FECHA_COB']");
//         if(btn.getAttribute("formaction").includes(actions.CAMBIO_DE_FECHA))
//             return input_cobrado.required = false;
//         return input_cobrado.required = true;
//     });

// });



