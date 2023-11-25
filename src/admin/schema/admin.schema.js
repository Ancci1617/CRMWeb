const { z } = require("zod");


const clienteSchema = z.object({

    CTE: z.string({ required_error: "El numero de cliente no puede estar vacio" }).regex(new RegExp("^\\d+$"),{message:"El dato del cliente debe ser un numero"}),
    NOMBRE: z.string({ required_error: "El nombre del cliente no puede estar vacio." }),
    CALLE: z.string({ required_error: "El domicilio del cliente no puede estar vacio." }),
    CRUCES: z.string({ required_error: "El cruce del cliente no puede estar vacio." }),
    CRUCES2: z.string({ required_error: "El nombre del cliente no puede estar vacio." }),
    WHATSAPP: z.string({ required_error: "El telefono del cliente no puede estar vacio." }),
    DNI: z.string({ required_error: "El dni del cliente no puede estar vacio." }),
    UBICACION: z.string({ required_error: "La ubicacion del domicilio no puede estar vacia." }).regex(new RegExp("^-\\d+\\.\\d+,-\\d+\.\\d+$"), { message: "El formato de la ubicacion no es correcto" })


})

// FECHA,CTE,FICHA,TOTAL,CUOTA,VENCIMIENTO,PRIMER_PAGO,CUOTA_ANT,CUOTA_ANT,SERV_ANT,MORA_ANT,ARTICULOS,SERV_UNIT
const fichasSchema = z.object({
    FECHA : z.string({required_error : "Fecha de venta es un dato necesario"}),
    CTE: z.string({ required_error: "El numero de cliente no puede estar vacio" }).regex(new RegExp("^\\d*$"),{message : "El dato enviado como numero de cliente debe ser un numero entero."}),
    FICHA : z.string({required_error : "Se debe enviar el numero de ficha"}),
    TOTAL : z.string({required_error : "Se debe el total de la venta"}),
    CUOTA : z.string({required_error : "Se debe enviar el valor de cuota"}),
    VENCIMIENTO : z.string({required_error : "Se debe enviar el primer vencimiento"}),
    PRIMER_PAGO : z.string({required_error : "Se debe enviar el primer pago"}),
    CUOTA_ANT : z.string({required_error : "Se debe enviar el saldo anterior"}),
    SERVICIO_ANT : z.string({required_error : "Se debe enviar el saldo de servicio anterior"}),
    MORA_ANT : z.string({required_error : "Se debe enviar el valor de saldo de mora anterior"}),
    ARTICULOS : z.string({required_error : "Se debe enviar los articulos de la ficha"}).regex(new RegExp("^\\d+(\\.\\d+)?(\\s{1}\\d+(\\.\\d+)?)*$"),{message : "Los articulos no tienen el formato correspondiente"}),
    SERV_UNIT : z.string({required_error : "Se debe enviar el valor de servicio unitario"})
    
})





module.exports = { clienteSchema, fichasSchema }



