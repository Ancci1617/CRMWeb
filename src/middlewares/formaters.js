const {format : formatDate} = require("date-fns")

const setFormaters = (req, res, next) => {
    const format = new Intl.NumberFormat("es-AR").format
    const formatNumber = (text) => text.replaceAll(/\d+/g, format)
    res.locals.formatNumber = formatNumber;

    res.locals.formatDate = (dateString) => formatDate(`${dateString}T00:00:00`,"dd/MM/yyyy");


    next()
}




module.exports = {setFormaters}