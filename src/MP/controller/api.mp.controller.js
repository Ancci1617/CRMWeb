const { getUserByUsuario } = require("../../model/auth/getUser.js");
const mercadoPagoModel = require("../model/mercadoPagoModel.js");


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
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${N_OPERACION}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + MP_TOKEN
            }
        })
        const MP_DATA = await response.json();

        if (MP_DATA.status == 404)
            return res.json({ success: true, found: false, msg: "El pago no se encuentra dentro de la cuenta declarada." });


        if (MP_DATA.error) {
            console.log("ERROR MP");
            console.log("MP_DATA", MP_DATA);
            console.log("Body_data", req.body);
            return res.json({ success: false, msg: "Error al intentar consultar a Mercado pago." });
        }

        if (MP_DATA.payer_id)
            return res.json({ success: true, found: true, available: false, msg: "La transferencia es un EGRESO DE DINERO, no un ingreso." });

        const { transaction_details } = MP_DATA;

        const N_OPERACION_DATA = await mercadoPagoModel.getOperationData({ N_OPERACION });
        console.log("🚀 ~ file: api.mp.routes.js:48 ~ Router.post ~ N_OPERACION_DATA:", N_OPERACION_DATA)

        //Revisamos si la plata que estamos pasando es mayor que la plata recibida
        if (N_OPERACION_DATA.TOTAL + parseInt(MONTO_CTE) + parseInt(MP_PORCENTAJE) > transaction_details.net_received_amount + 100)
            return res.json({
                success: true,
                found: true,
                available: false,
                data: {
                    net_worth: transaction_details.net_received_amount,
                    asociado: N_OPERACION_DATA
                },
                msg: `El dinero recibido no concuerda con los pagos que se intenta registrar.`
            });


        res.json({ success: true, found: true, available: true, msg: "Pago validado correctamente!." });


    } catch (error) {
        console.log("error", error);
        return res.json({ success: false, msg: "Error al consultar a Mercado Pago, verifique las credenciales de acceso." });
    }


}

module.exports = { postCheckMP }