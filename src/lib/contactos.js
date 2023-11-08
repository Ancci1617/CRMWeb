const { getClientes } = require("../model/CRM/get_tablas/get_clientes");
const { invalidarTelefonosDeCte, getContactoByTelefono, insertContacto, invalidarTelefono, getNuevoY } = require("../model/contactos/contactos.model");
const { getToday } = require("./dates");

//Volver promesas?? (Ventaja entre promesas y Funciona asincrona)
async function generarContactoCTE(CTE, Usuario, body, VENTA_ID = null) {
    const { TELEFONO } = body;

    const cte_data = await getClientes(CTE);

    if (!cte_data[0].CTE) return "Cliente invalido";

    await invalidarTelefono(TELEFONO);
    return await insertContacto("CTE", TELEFONO, getToday(), CTE, cte_data[0].ZONA, cte_data[0].NOMBRE, cte_data[0].CALLE, Usuario, VENTA_ID);

}



async function generarContactoY(Y, Usuario, body) {
    let { CTEYZ, ZONA, TELEFONO, NOMBRE, CALLE, TIPO } = body;

    const contactos = await getContactoByTelefono(TELEFONO);
    console.log("ES CLIENTE CONTACTO", contactos);
    if (contactos.length > 0) {
        const tipos = contactos.map(contacto => contacto.TIPO);

        if (tipos.includes("CTE")) {
            const CTE_CONTACTO = contactos.filter(contacto => contacto.TIPO == "CTE")[0].CTE
            return await generarContactoCTE(CTE_CONTACTO, Usuario, body);
        }
        if (tipos.includes("Z")) return "El contacto, ya pertenece a un IMAN, no se puede cargar como nuevo...";
    }

    ZONA = ZONA ? ZONA : "SZ";
    CALLE = CALLE ? CALLE : "SD";
    NOMBRE = NOMBRE ? NOMBRE : "SN";

    const YCODE = await getNuevoY();
    await invalidarTelefono(TELEFONO);
    return await insertContacto(TIPO, TELEFONO, getToday(), YCODE, ZONA, NOMBRE, CALLE, Usuario);

}

async function generarContactoZ(Z, Usuario, body) {
    const { CTEYZ, ZONA, TELEFONO, NOMBRE, CALLE, TIPO } = body;

    const contactos = await getContactoByTelefono(TELEFONO);

    if (contactos.length > 0) {
        const tipos = contactos.map(contacto => contacto.TIPO);
        if (tipos.includes("CTE")) return "El contacto, ya pertenece a un cliente, no se puede cargar como nuevo...";
    }

    await invalidarTelefono(TELEFONO);
    return await insertContacto(TIPO, TELEFONO, getToday(), 'YTEST', ZONA, NOMBRE, CALLE, Usuario);

}



module.exports = { generarContactoZ, generarContactoY, generarContactoCTE}