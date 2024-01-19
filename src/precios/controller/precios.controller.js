const { getLP, editarProducto,agregarProductoDB ,eliminarProductoDB} = require("../model/precios.model");




const formLp =  async (req, res) => {

    try {
        const LP = await getLP();
        const p = LP[0];
        console.log(p);
        console.log(p.LAST_UPDATED.toISOString());
        res.render("precios/main.ejs",{LP});
    } catch (error) {
        console.log(error);
        res.send("Error al renderizar lista de precios")
    }

}

//Recibe {Art ,CONTADO,CUOTAS_3,CUOTAS_6,ANTICIPO,CUOTAS_9}
const postEditarProducto = async (req,res) => {
    try {    
        const response = await editarProducto(req.body);    
        res.redirect("/LP");
    } catch (error) {
        console.log("error, no se pudo editar el producto",error);
        res.send("No se pudo editar el producto")        
    }

}

const agregarProducto = async (req,res) => {
    try {
        await agregarProductoDB(req.body)
        res.redirect("/LP");
    } catch (error) {
        console.log("error, no se pudo agregar el producto",error);
    res.send("No se pudo agregar el producto")        
    }
}

const eliminarProducto = async (req,res) => {
    try {
        const {ART} = req.params;
        await eliminarProductoDB(ART);
        res.redirect("/LP")
    } catch (error) {
        console.log("Error eliminar producto",req.params,error);
        res.send(`No se pudo eliminar el articulo.`)        
    }
}


module.exports = { formLp ,postEditarProducto,agregarProducto,eliminarProducto}



