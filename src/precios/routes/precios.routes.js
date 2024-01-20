const router = require("express").Router();
const {formLp,postEditarProducto, agregarProducto,eliminarProducto} = require("../controller/precios.controller.js");
const {hasPermission} = require("../../middlewares/permission.middleware.js");
const {LP_USER,LP_ADMIN} = require("../../constants/permisos.js");
const {validateSchema} = require("../../shared/middlewares/validateSchema.js");
const {productoSchema} = require("../schema/producto.schema.js");
const { checkDecimals } = require("../middlewares/checkDecimals.js");


router.get("/",hasPermission(LP_USER),formLp)
router.post("/editar_producto",hasPermission(LP_ADMIN),validateSchema(productoSchema),checkDecimals,postEditarProducto);
router.post("/agregar_producto",hasPermission(LP_ADMIN),validateSchema(productoSchema),checkDecimals,agregarProducto);
router.get("/eliminar/:ART",hasPermission(LP_ADMIN),eliminarProducto);




module.exports = router