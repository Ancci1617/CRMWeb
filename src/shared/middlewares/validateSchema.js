
const validateSchema = (schema) => (req, res, next) => {
    try {
        
        console.log(req.body)
        schema.parse(req.body);
        next()
    } catch (error) {
        return res.status(400).json({ errors: error.errors.map(err => err.message) })
    }

}

module.exports = {validateSchema}