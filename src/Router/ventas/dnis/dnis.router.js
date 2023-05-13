const Router = require("express").Router();
const fs = require("fs/promises");
const path = require("path");

const getDirectories = async src => (await fs.readdir(src, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)


Router.get("/dnis",async (req, res) => {
    const dirs = await getDirectories(path.join("..","ImagenesDeClientes"));
    const dirs_ordered = dirs.map( e => parseInt(e) ).filter(e => !isNaN(e)).sort((a,b)=>{
        if(a < b) return -1;
        if(b < a) return 1;
        return 0;
    });
    const links = dirs_ordered.map(dir_name => `/dnis/${dir_name}`);
    const data = { title : "Dnis" , items : dirs_ordered,links };
    res.render("list-items.ejs", { data });
});

Router.get("/dnis/:CTE",async (req, res) => {
    const {CTE} = req.params;
    res.render("ventas/dnis/dnis.visualizar.ejs",{CTE});
});








module.exports = Router;