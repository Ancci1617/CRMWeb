
/**
 * @param {Response} res 
 * 
 */

const {getToday} = require("../lib/dates");
const userView = (req,res,next) => {
    res.locals.user = req.user;
    res.locals.getToday = getToday;
    next();
}


module.exports = {userView};
