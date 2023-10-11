const btn_cambiar_fecha = document.querySelector(".btn-cambiar-fecha");
const btn_submit = document.querySelectorAll("input[type='submit']");

const creditos_arr = document.querySelectorAll(".credito");
const check_mp = document.getElementsByName("ISMP")

const mpCheckHandler = async (e) => {
    const credito = e.target;

    if (!credito.ISMP.checked) return;

    const creditoData = new FormData(credito);
    let obj = {};
    creditoData.forEach((value, key) => (obj[key] = value));
    const { N_OPERACION, MP_PORCENTAJE, MP_TITULAR, COBRADO } = obj;

    try {
        e.preventDefault();

        const sv_response = await fetch(`/mp/api/check_mp`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ N_OPERACION, MP_PORCENTAJE, MONTO_CTE: COBRADO, MP_TITULAR })
        })
        const response = await sv_response.json();

        console.log(response);
        alert(response.msg);
        
        if (response.success && !response.available) {
            return alert(`Valor del pago: ${response.data.net_worth}\nValores asociados: ${response.data.asociado.TOTAL} \nPagos asociados: 
                          ${response.data.asociado.CREDITOS.reduce((acum, cred) => (`${acum}\n Credito: ${cred.FICHA} Cobrado: ${cred.COBRADO}`), "")}`)
        }

        if(!response.success && !confirm("Cargar pago igualmente?")){
            return
        }
        return e.target.submit()


    } catch (error) {
        return alert("No se pudo validar el pago")
    }


}

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

    credito.querySelector(".check_mp").addEventListener("click", e => {
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


    //Al momento de subir un pago de MP valide que el dinero este en las cuentas
    credito.addEventListener("submit", mpCheckHandler);




})