const { getToday } = require("../../lib/dates.js");
const { getAtrasos, getVencimientoValido } = require("../../lib/doubt.js");
const { getFichasOptimized } = require("../../model/CRM/get_tablas/get_fichas.js");
const { getPagos } = require("../../pagos/model/pagos.model.js");


const generarInformeCobranza = async (zonas, cobrador) => {

    try {

        const today = new Date(getToday());
        const todayString = getToday();
        const dateReference = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1).toISOString().split("T")[0];
        const fichasRaw = await getFichasOptimized({ withAcumulado: false, withCambiosDeFecha: true },
            [`Fichas.Z in ('${zonas.join("','")}') `, `Fichas.ESTADO = 'ACTIVO'`, `Fichas.FICHA < 50000`]);

        const fichasObjetivo = fichasRaw.filter(ficha => ficha.FECHA < dateReference);

        const fichasEnRecorrido = fichasRaw.filter(ficha => ficha.SALDO > 0).reduce((acum, ficha) => {
            const { VENCIMIENTO_EVALUA } = getVencimientoValido({ PRIMER_PAGO: ficha.PRIMER_PAGO, VENCIMIENTO: ficha.VENCIMIENTO });
            const { atraso_eval } = getAtrasos({ CUOTAS : ficha.CUOTA, TOTAL : ficha.TOTAL, SALDO : ficha.SALDO, CUOTA : ficha.CUOTA  ,VENCIMIENTO_EVALUA});
            return acum + (atraso_eval > 0 && (ficha.CDeFecha || todayString) <= todayString )
        }, 0)

        const pagos = await getPagos(`PagosSV.FECHA = '${todayString}'`, `PagosSV.COBRADOR = '${cobrador}'`);
        const pagosCobrado = pagos.reduce((acum, pago) => acum + pago.VALOR, 0);

        const fichas = fichasObjetivo.map(ficha => {
            const { VENCIMIENTO_EVALUA } = getVencimientoValido({ PRIMER_PAGO: ficha.PRIMER_PAGO, VENCIMIENTO: ficha.VENCIMIENTO });
            const atrasos = getAtrasos({ CUOTA: ficha.CUOTA, CUOTAS: ficha.CUOTAS, SALDO: ficha.SALDO, TOTAL: ficha.TOTAL, VENCIMIENTO_EVALUA })
            const atrasadoYAbonoCuota = atrasos.atraso_eval > 0 && ficha.CUOTA_PAGO > 0;
            return { ...ficha, ...atrasos, atrasadoYAbonoCuota };
        });

        const cobradas = fichas.filter(ficha => ficha.CUOTA_PAGO >= Math.min(ficha.CUOTA, ficha.CUOTA_ANT))


        const fichasResumen = fichas.reduce((acum, ficha) => {
            return {
                PorCobrar: acum.PorCobrar + ficha.CUOTA,
                Atrasadas: acum.Atrasadas + Math.min(ficha.atraso_eval, 1),
                Cobrado: acum.Cobrado + ficha.CUOTA_PAGO,
                AtrasadasYAbonaronCuota: acum.AtrasadasYAbonaronCuota + ficha.atrasadoYAbonoCuota,
                EstaEnRecorrido: acum.EstaEnRecorrido + ficha.estaEnRecorrido
            }
        }, { PorCobrar: 0, Atrasadas: 0, Cobrado: 0, AtrasadasYAbonaronCuota: 0, EstaEnRecorrido: 0 });



        const informe = {
            Fichas: {
                Objetivo: fichas.length,
                Resultado: cobradas.length,
                Hoy: pagos.length
            },
            Monto: {
                Objetivo: new Intl.NumberFormat('es-AR').format(fichasResumen.PorCobrar), /*Monto de CobradoCantidad.Objetivo SUMA(CUOTA_PAGO) / min(SALDO_ANTERIOR,CUOTA)*/
                Resultado: new Intl.NumberFormat('es-AR').format(fichasResumen.Cobrado), /*Monto de CobradoCantidad.Resultado*/
                Hoy: new Intl.NumberFormat('es-AR').format(pagosCobrado)/*Monto de CobradoCantidad.Hoy*/
            },
            Atrasadas: {
                Objetivo: fichasResumen.Atrasadas, //Atrasadas en cartera
                Resultado: fichasResumen.AtrasadasYAbonaronCuota, /* Atrasadas y ya pagaron este mes */
                Hoy: fichasEnRecorrido /*En recorridos */
            },
            Porcentaje: {
                Objetivo: 90 + "%",
                Resultado: Math.round((fichasResumen.Cobrado / fichasResumen.PorCobrar) * 1000) / 10 + "%",
                Hoy: Math.round((pagosCobrado / fichasResumen.PorCobrar) * 10000) / 100 + "%",
            }
        }

        return informe

    } catch (error) {

        console.log("error al generar el informe");
        console.log("error", error);

    }


}

module.exports = { generarInformeCobranza }



