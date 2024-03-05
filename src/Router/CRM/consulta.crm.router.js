const Router = require("express").Router();
const pool = require("../../model/connection-database.js")
const { getClientes } = require("../../model/CRM/get_tablas/get_clientes")
const { getFichas, getFichasOptimized } = require("../../model/CRM/get_tablas/get_fichas")
const { getCliente } = require("../../lib/get_cliente");
const { getDomicilio } = require("../../model/CRM/get_tablas/get_domicilio.js");
const { isLoggedIn } = require("../../lib/auth");
const { guardar_respuesta_crm } = require("../../model/CRM/guardar-consulta.js");
const { getDoubt, getAtrasos, getVencimientoValido, getDebtEasy } = require("../../lib/doubt.js");
const express = require("express");
const path = require("path");
const { getBaseDetalle } = require("../../shared/model/cteData.js");
const { getMaster, getMasterPorLote } = require("../../shared/calificaciones/calcularCalificaciones.js");
const { getFichasVigentes } = require("../../shared/lib/fichas.js");
const { splitPrestamosFichas } = require("../../lib/fichas.js");

Router.use(isLoggedIn, express.static(path.join("..", "ImagenesDeClientes")));


Router.get("/CRM", isLoggedIn, (req, res) => {
    const CTE = req.query.CTE;
    res.render("CRM/CRM.ejs", { CTE });
});


Router.post("/query_CRM", isLoggedIn, async (req, res) => {

    const query_result = {};

    //cte tiene que ser = al resultado de una funcion que busque el cliente en funcion del dato
    //Si getCTE(req.body) = -1  corta el algoritnmo, caso contrario continua la consulta
    const cte_data = await getCliente(req.body);

    const cte = cte_data.CTE;
    const hora = new Date(new Date().getTime() - 1000 * 60 * 60 * 3).toISOString().substring(0, 19);


    // if(memo[cte]) return res.json(memo[cte]);
    if (cte === -1) {
        guardar_respuesta_crm(req.user.Usuario, JSON.stringify(req.body), JSON.stringify({ CTE: "No encontrado" }), hora);
        return res.json({ "Clientes": [{ CTE: -1 }] });
    }

    query_result.Clientes = await getClientes(cte);

    /* BUSCA Y FORMATEA LOS CREDITOS ACTIVOS */
    const creditosVigentes = await getFichasVigentes(cte, { withAcumulado: true, withCambiosDeFecha: true })

    const { fichas: fichasVigentes, prestamos: prestamosVigentes } = splitPrestamosFichas(creditosVigentes);

    query_result.Fichas = fichasVigentes.map(ficha => {

        const { FECHA_FORMAT, FICHA, Z, TOTAL, ANT, MES0, MES1, MES2, MES3, MES4, MES5, CUOTA_ANT, CUOTA_PAGO, SALDO, CUOTA, VALOR_UNITARIO, VENCIMIENTO, CDeFecha, CUOTAS, ESTADO, vencidas, pagas, atraso } = ficha;

        return { FECHA_FORMAT, FICHA, Z, TOTAL, ANT, MES0, MES1, MES2, MES3, MES4, MES5, CUOTA_ANT, CUOTA_PAGO, SALDO, CUOTA, VALOR_UNITARIO, VENCIMIENTO, CDeFecha, vencidas, pagas, CUOTAS, atraso, ESTADO };

    });
    
    query_result.Prestamos = prestamosVigentes.map(ficha => {
        const { FECHA_FORMAT, FICHA, Z, ANT, MES0, MES1, MES2, MES3, MES4, MES5, MES6,
            CUOTA_ANT, SALDO, VENCIMIENTO,
            CDeFecha, CUOTAS, ARTICULOS, CUOTA_PAGO, CUOTA, ESTADO,vencimiento_vigente,servicio,mora,cuota } = ficha;

        return { FECHA_FORMAT, FICHA, Z, ARTICULOS, ANT, MES0, MES1, MES2, MES3, MES4, MES5, MES6, CUOTA_ANT, CUOTA_PAGO, SALDO, CUOTA, CUOTAS, VENCIMIENTO, vencimiento_vigente, CDeFecha, servicio, mora, cuota, ESTADO };
    });




    /*Busca y formatea los datos historicos */
    const BaseDetalle = await getBaseDetalle({ CTE: cte, orderBy: "FECHA", order: "asc" })
    
    query_result.MasterBGM = BaseDetalle.filter(ficha => ficha.FICHA <= 50000).map(ficha => {
        const { Mes, FECHA, FICHA, Z, VTA, Atraso, Anticipo, CUOTA_1, CUOTA_2, CUOTA_3, CUOTA_4, CUOTA_5, SAL_ANT, CUOTA_6, SAL_ACT, Cuota, PAGO_EN, VALOR_UNITARIO, ORIGINALES, ESTADO } = ficha
        return { Mes, FECHA, FICHA, Z, VTA, Atraso, Anticipo, CUOTA_1, CUOTA_2, CUOTA_3, CUOTA_4, CUOTA_5, SAL_ANT, CUOTA_6, SAL_ACT, Cuota, PAGO_EN, VALOR_UNITARIO, ORIGINALES, ESTADO }
    })
    
    query_result.MasterEC = BaseDetalle.filter(ficha => ficha.FICHA >= 50000).map(ficha => {
        const { FECHA, FICHA, Z, CAPITAL, Atraso, Anticipo, CUOTA_1, CUOTA_2, CUOTA_3, CUOTA_4, CUOTA_5, SAL_ANT, CUOTA_6, SAL_ACT, Cuota, ORIGINALES, ESTADO, VENCIMIENTO } = ficha
        return { FECHA, FICHA, Z, CAPITAL, Atraso, Anticipo, CUOTA_1, CUOTA_2, CUOTA_3, CUOTA_4, CUOTA_5, SAL_ANT, CUOTA_6, SAL_ACT, Cuota, ORIGINALES, ESTADO, VENCIMIENTO }
    })




    const { disponibleFinalBgm, calificacionBgm, disponibleFinalEasy } = await getMaster(cte)

    query_result.Disponible = [{ BGM: disponibleFinalBgm, CALIF: calificacionBgm, CAPITAL: disponibleFinalEasy }]
    const domicilio = await getDomicilio(cte_data.CALLE);
    const clientesEnDomicilio = domicilio.map(cte => cte.CTE);

    console.log(clientesEnDomicilio);

    const calificacionesDeClientesDelDomicilio = await getMasterPorLote(clientesEnDomicilio);

    console.log(calificacionesDeClientesDelDomicilio);

    query_result.Domicilio = domicilio.map(cliente => {
        const { calificacionBgm: CALIF } = calificacionesDeClientesDelDomicilio.find(cte => cte.CTE == cliente.CTE);


        if (cliente => cliente.FICHA && cliente.FICHA < 50000) {
            const { VENCIMIENTO, PRIMER_PAGO, CUOTAS, SALDO, CUOTA, TOTAL } = cliente;
            const { VENCIMIENTO_EVALUA } = getVencimientoValido({ VENCIMIENTO, PRIMER_PAGO });
            const { atraso_eval } = getAtrasos({ CUOTAS, CUOTA, SALDO, TOTAL, VENCIMIENTO_EVALUA });


            return { CALIF, NOMBRE: cliente.NOMBRE, CTE: cliente.CTE, CREDITO: cliente.FICHA, atraso: atraso_eval };
        }

        return { CALIF, NOMBRE: cliente.NOMBRE, CTE: cliente.CTE, CREDITO: cliente.FICHA, atraso: null }

    })

    // memo[cte] = query_result;
    //Appendiarlo junto a la data que va a ser respondida

    guardar_respuesta_crm(req.user.Usuario, JSON.stringify(req.body), JSON.stringify(query_result), hora);


    res.json(query_result);
})




module.exports = Router