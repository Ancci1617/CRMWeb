const filtrarIngresosYEgresos = (payments) => {


    const ingresos = payments.filter(payment => !payment.payer_id).reduce((acum, payment) => acum + Math.round(payment.transaction_details.net_received_amount), 0);
    const egresos = payments.filter(payment => payment.payer_id).reduce((acum, payment) => acum + Math.round(payment.transaction_details.net_received_amount), 0);
    return {ingresos,egresos}

}

module.exports = {filtrarIngresosYEgresos}



