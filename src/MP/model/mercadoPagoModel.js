const pool = require("../../model/connection-database.js");

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




module.exports = { getOperationData }