const { pagosModel } = require("../model/pagos.model.js");


async function cargarCobranza(req, res) {
    const { FECHA, COB } = req.query;
    const data = await pagosModel.getFechasDePagosYCobradores();
    const FECHAS = [...new Set(data.map(obj => obj.FECHA))];    
    const render_links = FECHAS.map(fecha_evaluada => {
        return {
            FECHA : fecha_evaluada,
            COBRADORES : data.filter(obj => obj.FECHA == fecha_evaluada).map(obj => obj.COBRADOR)
        }
    });

    const pagos = await pagosModel.getPagosByFechaYCob({COB, FECHA});

    console.log("PAGOS",pagos);


    res.render("pagos/pagos.cargar_cobranzas.ejs",{aside: render_links,pagos});
}

async function redistribuirPago(req,res){
    
}





module.exports = { cargarCobranza };