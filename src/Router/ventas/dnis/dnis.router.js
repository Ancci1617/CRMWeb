const Router = require("express").Router();
const fs = require("fs/promises");
const path = require("path");

const getDirectories = async src => (await fs.readdir(src, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)


Router.get("/dnis",async (req, res) => {
    const dirs = await getDirectories(path.join("..","ImagenesDeClientes"));
    const links = dirs.map(dir_name => `/dnis/${dir_name}`);
    const data = { title : "Dnis" , items : dirs,links };
    res.render("list-items.ejs", { data });
});

Router.get("/dnis/:CTE",async (req, res) => {
    const {CTE} = req.params;
    res.render("ventas/dnis/dnis.visualizar.ejs",{CTE});
});








module.exports = Router;