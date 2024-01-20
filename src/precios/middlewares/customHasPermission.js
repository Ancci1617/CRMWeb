const {LP_ADMIN,LP_GERENCIA,LP_USER} = require("../../constants/permisos");
const { validateSchema } = require("../../shared/middlewares/validateSchema");
const { productoSimpleSchema,productoSchema } = require("../schema/producto.schema");

const customHasPermission = (req,res,next) => {
    const {hasPermission} = res.locals;

    //Si es gerencia -> valida el schema total
    if(hasPermission(LP_GERENCIA)){
        return validateSchema(productoSchema,true)(req,res,next);

    }
    
    //Si es admin -> valida el schema 
    return validateSchema(productoSimpleSchema,true)(req,res,next);
    
}


module.exports = {customHasPermission}

