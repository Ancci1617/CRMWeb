

async function getRendicionCobranza(req, res) {

    console.log("render");

            

    res.render("pagos/rendiciones/rendicion_cobranza.cobrador.ejs");

}


module.exports = { getRendicionCobranza };