const router = require("express").Router();
const {formLp,postEditarProducto, agregarProducto,eliminarProducto} = require("../controller/precios.controller.js");
const {hasPermission} = require("../../middlewares/permission.middleware.js");
const {LP_USER,LP_ADMIN} = require("../../constants/permisos.js");

router.get("/",hasPermission(LP_USER),formLp)
router.post("/editar_producto",hasPermission(LP_ADMIN),postEditarProducto);
router.post("/agregar_producto",hasPermission(LP_ADMIN),agregarProducto);
router.get("/eliminar/:ART",hasPermission(LP_ADMIN),eliminarProducto);




module.exports = router