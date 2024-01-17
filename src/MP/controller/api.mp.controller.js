const { getUserByUsuario, getUsuariosWithMp } = require("../../model/auth/getUser.js");
const mercadoPagoModel = require("../model/mercadoPagoModel.js");
const { getAside } = require("../lib/aside.js");
const { get_body } = require("../constants/fetch_body.js");
const { getPagosMP } = require("../../pagos/model/pagos.model.js");
const axios = require("axios");
const { getLimitDates, getToday } = require("../../lib/dates.js");

const postCheckMP = async (req, res) => {
    const { N_OPERACION, MP_PORCENTAJE, MONTO_CTE, MP_TITULAR } = req.body;
    //parametros de respuesta : 
    //success : existio algun error tecnico al consultar el MercadoPago
    //msg : leyenda que explica la situacion del N_OPERACION
    //found : El pago se encontro dentro de la cuenta
    //available : El saldo de pago disponible asociado al cliente se puede ingresar al sistema
    //data : datos del lado de PagosSV asociados al N_OPERACION

    const user = await getUserByUsuario(MP_TITULAR);
    const { MP_TOKEN } = user;
    if (user.username == -1)
        return res.json({ success: false, msg: "El Titular de este MP no existe." });
    if (!MP_TOKEN)
        return res.json({ success: false, msg: "El MP de este titular no se encuentra asociado a la empresa, no se pudo validar el pago." });

    try {

        const { data: MP_DATA } = await axios.get(`https://api.mercadopago.com/v1/payments/${N_OPERACION}`, get_body(MP_TOKEN))


        if (MP_DATA.payer_id)
            return res.json({ success: true, found: true, available: false, msg: "La transferencia es un EGRESO DE DINERO, no un ingreso." });


        const { transaction_amount } = MP_DATA;

        const N_OPERACION_DATA = await mercadoPagoModel.getOperationData({ N_OPERACION });
        //Revisamos si la plata que estamos pasando es mayor que la plata recibida
        if (N_OPERACION_DATA.TOTAL + parseInt(MONTO_CTE) + parseInt(MP_PORCENTAJE) > transaction_amount + 100)
            return res.json({
                success: true,
                found: true,
                available: false,
                data: {
                    net_worth: transaction_amount,
                    asociado: N_OPERACION_DATA
                },
                msg: `El dinero recibido no concuerda con los pagos que se intenta registrar.`
            });


        res.json({ success: true, found: true, available: true, msg: "Pago validado correctamente!." });


    } catch (error) {
        const { data: MP_DATA } = error.response;

        if (MP_DATA.status == 404)
            return res.json({ success: true, found: false, msg: "El pago no se encuentra dentro de la cuenta declarada." });

        if (MP_DATA.error)
            return res.json({ success: false, msg: "Error al intentar consultar a Mercado pago." });



        return res.json({ success: false, msg: "Error al consultar a Mercado Pago, verifique las credenciales de acceso." });

    }


}

const formController = async (req, res) => {
    const aside = await getAside();
    const { MES, MP_TITULAR } = req.query;
    const user = await getUserByUsuario(MP_TITULAR);

    if (!MES || !MP_TITULAR) return res.render("MP/mp.list.ejs", { payments: [], aside, MP_TITULAR: user, MES });


    const { START_DATE, END_DATE } = getLimitDates({ MES })


    const payments = await mercadoPagoModel.getPayments({ MP_TOKEN: user.MP_TOKEN, START_DATE, END_DATE, filtered: true });
    const pagos_mp = await getPagosMP();


    payments.forEach(payment => {
        payment.asociados = pagos_mp.filter(pago => pago.MP_OPERACION == payment.id)
    });


    res.render("MP/mp.list.ejs", { payments, aside, MP_TITULAR: user, MES });
}

const getSaldoEnCuentas = async (req, res) => {
    const usuarios = await getUsuariosWithMp();
    const [year, month] = getToday().split("-");
    const { START_DATE, END_DATE } = getLimitDates({ MES: `${year}-${month}` });

    let result = [];
    for (let i = 0; i < usuarios.length; i++) {

        const mp_data = await mercadoPagoModel.getPayments({ MP_TOKEN: usuarios[i].MP_TOKEN, START_DATE, END_DATE });

        const ingresos = mp_data.results.filter(payment => !payment.payer_id).reduce((acum, payment) => acum + Math.round(payment.transaction_details.net_received_amount), 0);
        const egresos = mp_data.results.filter(payment => payment.payer_id).reduce((acum, payment) => acum + Math.round(payment.transaction_details.net_received_amount), 0);
        result.push({
            titular: usuarios[i].Usuario,
            limite: usuarios[i].LIMITE_FACTURACION,
            saldo_ant: usuarios[i].MP_SALDO_ANT,
            ingresos, egresos,
            saldo_act: usuarios[i].MP_SALDO_ANT + ingresos - egresos,
            disponible: usuarios[i].LIMITE_FACTURACION - ingresos,
            alias : usuarios[i].ALIAS
        })

    }

    console.log(result);
    res.json(result)
}


module.exports = { postCheckMP, formController, getSaldoEnCuentas }