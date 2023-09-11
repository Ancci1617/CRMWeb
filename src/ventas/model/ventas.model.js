const pool = require("../../model/connection-database.js");

const getVentas = async ({FECHA_VENTA,USUARIO}) => {
    try {
        const [ventas] = await pool.query("SELECT * FROM VentasCargadas where FECHA_VENTA = ? AND USUARIO = ? AND VISIBLE = 1 ",[FECHA_VENTA,USUARIO]);

        return ventas;

    } catch (error) {
        console.error(error);
        console.log("error al momento de consultas las ventas");
    }
}

const getAsideVentas = async () => {
    try {
        const [ventas] = await pool.query("SELECT DISTINCT USUARIO,FECHA_VENTA as FECHA FROM VentasCargadas where VISIBLE = 1 order by FECHA_VENTA DESC");
        // "SELECT DISTINCT COBRADOR,FECHA FROM `PagosSV` WHERE CONFIRMACION != 'INVALIDO' ORDER BY `PagosSV`.`FECHA` DESC;";
        return ventas;


    } catch (error) {
        console.error(error);
        console.log("error al momento de consultas el ASIDE DE las ventas");
    }
}


module.exports = { getAsideVentas ,getVentas}




