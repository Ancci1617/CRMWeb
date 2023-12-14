const { z } = require("zod");

const ventaSchema = z.object({


    CTE: z.string({ required_error: "El numero de cliente no puede estar vacio" }).regex(new RegExp("^\\d+$"), { message: "El dato del cliente debe ser un numero." }),
    FICHA: z.string({ required_error: "El numero de ficha no puede estar vacio" }).regex(new RegExp("^\\d{4}$"), { message: "El numero de ficha deben ser 4 digitos." }),
    NOMBRE: z.string({ required_error: "El nombre del cliente no puede estar vacio" }),
    ZONA: z.string({ required_error: "La zona no puede estar vacia" }).regex(new RegExp("^.{2}$"), { message: "La zona debe tener una longitud de 2 caracteres" }),
    // CALLE: z.string({ required_error: "El domicilio no puede estar vacio" }),
    CRUCES : z.string({required_error:"el cruce12 no puede estar vacio"})
    // CRUCES2
    // WHATSAPP 
    // DNI
    // ARTICULOS
    // TOTAL
    // CUOTA
    // ANTICIPO
    // PRIMER_PAGO
    // CUOTAS_PARA_ENTREGA
    // FECHA_VENTA
    // ubicacion_cliente
    // APROBADO
    // LATITUD_VENDEDOR
    // LONGITUD_VENDEDOR
    // ACCURACY_VENDEDOR
    // PRIMER_VENCIMIENTO

})

module.exports = { ventaSchema }






