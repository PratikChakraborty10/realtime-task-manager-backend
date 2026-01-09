const { ZodError } = require('zod');

/**
 * Validation middleware factory
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {string} source - 'body', 'query', or 'params'
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[source];
            const parsed = schema.parse(data);
            req[source] = parsed; // Replace with parsed/transformed data
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map(e => ({
                    field: e.path.join('.') || 'unknown',
                    message: e.message
                }));

                return res.status(400).json({
                    success: false,
                    message: errors[0]?.message || 'Validation error',
                    errors // All errors for detailed debugging
                });
            }
            next(error);
        }
    };
};

module.exports = { validate };

