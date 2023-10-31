const { default: axios } = require("axios");
const pool = require("../../model/connection-database.js");
const { get_body } = require("../constants/fetch_body.js");
const getPayments = async ({ MP_TOKEN, START_DATE, END_DATE, filtered = false }) => {
    try {

        const { data: raw_payments } = await axios.get(`https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=${START_DATE}&end_date=${END_DATE}&status=approved&limit=200`, get_body(MP_TOKEN))

        if (filtered) {
            const payments = raw_payments.results.filter(payment => !payment.payer_id && payment.transaction_amount > 100);
            return payments
        }

        return raw_payments

    } catch (error) {
        console.log("ERROR AL BUSCAR PAGOS EN MP")
        console.log(error);
        return [];
    }

}
const getOperationData = async ({ N_OPERACION }) => {

    try {
        const [data] = await pool.query(`SELECT
        PagosSV.FICHA,
        IFNULL(PagosSV.VALOR, 0) + IFNULL(PagosSV.SERV, 0) + IFNULL(PagosSV.MORA, 0) + IFNULL(PagosSV.MP, 0) AS COBRADO
    FROM
        PagosSV
    WHERE
        PagosSV.CONFIRMACION != 'INVALIDO' AND MP_OPERACION = ?;`, [N_OPERACION])

        return {
            TOTAL: data.reduce((accum, ficha) => { return accum + parseInt(ficha.COBRADO) }, 0),
            CREDITOS: data
        };


    } catch (error) {
        console.log("Error al validar Numero de operacion ", error);
        return {};
    }

}

const getSaldoEnCuenta = async ({ MP_TOKEN }) => {
    try {

    } catch (error) {
        console.log(error);
    }
}


module.exports = { getOperationData, getPayments ,getSaldoEnCuenta}