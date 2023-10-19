const btn_cambiar_fecha = document.querySelector(".btn-cambiar-fecha");
const btn_submit = document.querySelectorAll("input[type='submit']");

const creditos_arr = document.querySelectorAll(".credito");
const check_mp = document.getElementsByName("ISMP")

console.log("vinculado")

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