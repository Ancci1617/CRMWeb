const { Router } = require("express");
const adminController = require("../controller/admin.controller.js");
const { validateSchema } = require("../../shared/middlewares/validateSchema.js");
const { clienteSchema, fichasSchema } = require("../schema/admin.schema.js");
const { validateParamsNCTE } = require("../middlewares/admin.data.validation.js");
const { destructurarUbicacion } = require("../../ubicaciones/middleware/ubicaciones.middleware.js");
const {hasPermission} =require("../../middlewares/permission.middleware.js");
const permisos = require("../../constants/permisos.js");


const router = Router();

//Puede entrar a ver los datos si almenos tiene el permiso de admin_cob
router.get("/editarCliente/:cte", validateParamsNCTE,hasPermission(permisos.ADMIN_COB), adminController.editarClienteForm);

router.post("/editarCliente/:cte",
    validateParamsNCTE,
    validateSchema(clienteSchema),
    destructurarUbicacion,
    adminController.editarClientePost);

router.get("/editarFicha/:FICHA",adminController.editarFichaForm);

router.post("/editarFicha/:FICHA",validateSchema(fichasSchema),adminController.editarFichaPost);

router.get("/cargarDevolucion/:FICHA",adminController.cargarDevolucion);




module.exports = router;




