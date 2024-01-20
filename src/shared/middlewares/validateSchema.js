
const validateSchema = (schema,replaceBody = false) => (req, res, next) => {
    try {
        
        const validatedObject = schema.parse(req.body);
        replaceBody ? req.body = validatedObject : null;
        next()
    } catch (error) {
        return res.status(400).json({ errors: error.errors.map(err => err.message) })
    }

}

module.exports = {validateSchema}