
const checkQuery = (req,res,next) => {
    const {aside} = res.locals;

    const { MES, MP_TITULAR } = req.query;
    if (!MES || !MP_TITULAR) return res.render("MP/mp.list.ejs", { payments: [], aside, MP_TITULAR: {}, MES });
    
    next()
}



module.exports = {checkQuery}

