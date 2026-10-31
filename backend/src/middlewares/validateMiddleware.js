const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const msg = (result.error.issues && result.error.issues[0]?.message) ||
                    (result.error.errors && result.error.errors[0]?.message) ||
                    'Validation failed';
        return res.status(400).json({ message: msg });
    }
    req.body = result.data;
    next();
};

module.exports = { validate };
