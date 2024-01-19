const z = require("zod");

const productoSchema = z.object({

    Art: z.string({ required_error: "El articulo es un campo obligatorio." }),

    Producto: z.string({ required_error: "La descripcion del producto es un campo obligatorio." }),

    CONTADO: z.string({ required_error: "Valor al contado incompleto." })
        .regex(new RegExp("^\\d+$"), { message: "El valor al contado debe ser un numero, no debe contener ni puntos ni comas." }),

    CUOTAS_3: z.string({ required_error: "Valor en 3 cuotas incompleto." })
        .regex(new RegExp("^\\d+$"), { message: "El valor en 3 cuotas debe ser un numero, no debe contener ni puntos ni comas." }),

    CUOTAS_6: z.string({ required_error: "Valor en 6 cuotas incompleto." })
        .regex(new RegExp("^\\d+$"), { message: "El valor en 6 cuotas debe ser un numero, no debe contener ni puntos ni comas." }),

    ANTICIPO: z.string({ required_error: "Valor anticipo incompleto." })
        .regex(new RegExp("^\\d+$"), { message: "El del anticipo debe ser un numero, no debe contener ni puntos ni comas." }),

    CUOTAS_9: z.string({ required_error: "Valor en 9 cuotas incompleto." })
        .regex(new RegExp("^\\d+$"), { message: "El valor en 9 cuotas debe ser un numero, no debe contener ni puntos ni comas." }),



})




module.exports = {productoSchema}
