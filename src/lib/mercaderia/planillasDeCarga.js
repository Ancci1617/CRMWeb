const { getPlanillaCarga,crearPlanilla } = require("../../model/mercaderia/planilla");
const { getUserByUsuario } = require("../../model/auth/getUser");

async function generarPlanillaDeCargaParcial(VENDEDOR, FECHA, UNIDAD) {
    let planilla_object = { ARTICULOS: [] };
    //Genera la planilla de carga
    await crearPlanilla(VENDEDOR, FECHA, JSON.stringify(planilla_object), null, null, null, "[]", UNIDAD);

}



const getPlanilla = async (VENDEDOR, FECHA) => {
    //Si la planilla no existe la crea
    let planilla = await getPlanillaCarga(VENDEDOR, FECHA);

    if(!planilla){
        const VENDEDOR_USER = await getUserByUsuario(VENDEDOR);
        await generarPlanillaDeCargaParcial(VENDEDOR, FECHA, VENDEDOR_USER.UNIDAD);
        planilla = await getPlanillaCarga(VENDEDOR, FECHA);
    }

    return planilla;

}

module.exports = { getPlanilla }