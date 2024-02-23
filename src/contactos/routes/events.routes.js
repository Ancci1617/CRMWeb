


const emitter = require("../../shared/EventNotifier/emitter.js")
const { ventaCargada } = require("../controller/contactos.controller.js")


//Agregar middlewares
emitter.on("ventaCargada",ventaCargada)






