const btn_cambiar_fecha = document.querySelector(".btn-cambiar-fecha");
const btn_submit = document.querySelectorAll("input[type='submit']");

const creditos_arr = document.querySelectorAll(".credito");
const check_mp = document.getElementsByName("ISMP")


const mpCheckHandler = async (e) => {
    const credito = e.target;
    if (!credito.ISMP) return;

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


        alert(response.msg);

        if (response.success && !response.available) {
            return alert(`Valor del pago: ${response.data.net_worth}\nValores asociados: ${response.data.asociado.TOTAL} \nPagos asociados: 
                          ${response.data.asociado.CREDITOS.reduce((acum, cred) => (`${acum}\n Credito: ${cred.FICHA} Cobrado: ${cred.COBRADO}`), "")}`)
        }

        if (!response.success && !confirm("Cargar pago igualmente?")) {
            return
        }
        return e.target.submit()


    } catch (error) {
        return alert("No se pudo validar el pago")
    }


}

creditos_arr.forEach(credito => {
    const btn_submit = [...credito.querySelectorAll("input[type='submit']")];

    btn_submit.find(element => element.formAction.includes("cambiarFecha"))?.addEventListener("click", e => {

        credito.FECHA_COB.required = true;
        (credito.COBRADO) && (credito.COBRADO.required = false);
        (credito.DECLARADO_COB) && (credito.DECLARADO_COB.required = false);
        (credito.DECLARADO_CUO) && (credito.DECLARADO_CUO.required = false);
        (credito.DECLARADO_MORA) && (credito.DECLARADO_MORA.required = false);
        (credito.DECLARADO_SERV) && (credito.DECLARADO_SERV.required = false);
        return
    })
    btn_submit.find(element => element.formAction.includes("cargar_pago"))?.addEventListener("click", e => {
        credito.FECHA_COB.required = false;
        (credito.COBRADO) && (credito.COBRADO.required = true);
        (credito.DECLARADO_COB) && (credito.DECLARADO_COB.required = true);
        (credito.DECLARADO_CUO) && (credito.DECLARADO_CUO.required = true);
        (credito.DECLARADO_MORA) && (credito.DECLARADO_MORA.required = true);
        (credito.DECLARADO_SERV) && (credito.DECLARADO_SERV.required = true);
        return
    })


    //Al momento de subir un pago de MP valide que el dinero este en las cuentas
    credito.addEventListener("submit", mpCheckHandler);

})