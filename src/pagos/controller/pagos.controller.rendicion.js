"use strict";

async function getRendicionCobranza(req, res) {

    res.render("pagos/rendiciones/rendicion_cobranza.cobrador.ejs");

}


module.exports = { getRendicionCobranza };