const { getVencimientoValido } = require("../../lib/doubt");

const agregarMeses = (fichas) => {
    console.log(fichas[0].acumulado);
    fichas.forEach(ficha => {

        for (let i = 1; i < ficha.acumulado.length; i++) {

            const auxiliar = new Date(ficha.acumulado[i - 1].MES_ANIO);

            if (new Date(ficha.acumulado[i].MES_ANIO).toISOString().split("T")[0]
                !=
                new Date(auxiliar.getUTCFullYear(), auxiliar.getUTCMonth() + 1).toISOString().split("T")[0]) {


                const fecha_aux = new Date(ficha.acumulado[i - 1].MES_ANIO);
                const mes_anio_date = new Date(fecha_aux.getUTCFullYear(), fecha_aux.getUTCMonth() + 1);
                const [year, month] = mes_anio_date.toISOString().split("-");
                ficha.acumulado.splice(i, 0, { MES_ANIO: `${year}-${month}`, MES: parseInt(month), CUOTA: 0, MORA: 0, SERV: 0 });
                i = i + 2;
            }

        }

        //Agrega los 0 iniciales
        const { VENCIMIENTO_EVALUA } = getVencimientoValido({ VENCIMIENTO: ficha.data.VENCIMIENTO, PRIMER_PAGO: ficha.data.PRIMER_PAGO });
        const { acumulado } = ficha;
        if (acumulado.length == 0) return;

        while (new Date(acumulado[0].MES_ANIO) > new Date(VENCIMIENTO_EVALUA)) {

            const fecha_aux = new Date(acumulado[0].MES_ANIO);
            const mes_anio_date = new Date(fecha_aux.getUTCFullYear(), fecha_aux.getUTCMonth() - 1);
            const [year, month] = mes_anio_date.toISOString().split("-");
            const obj = { MES_ANIO: `${year}-${month}`, MES: parseInt(month), CUOTA: 0, MORA: 0, SERV: 0 };
            ficha.acumulado.unshift(obj);

        }

    })

}

module.exports = {agregarMeses}