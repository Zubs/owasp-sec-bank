const Joi = require('joi');

exports.validate = (schema, property = 'body') => {
    return (
        req,
        res,
        next
    ) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const messages = error.details.map(d => d.message).join('; ');

            return res.status(400).json({ error: 'Validation failed', details: messages });
        }

        req[property] = value;
        next();
    };
};

exports.registerSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(50)
        .required()
        .messages({ 'string.alphanum': 'Username must only contain letters and numbers' }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
        .required()
        .messages({ 'string.pattern.base': 'Password must contain at least one letter and one number' }),
    full_name: Joi.string()
        .min(2)
        .max(100)
        .required(),
    email: Joi.string()
        .email()
        .max(255)
        .required()
});

exports.loginSchema = Joi.object({
    username: Joi.string()
        .max(50)
        .required(),
    password: Joi.string()
        .max(128)
        .required()
});

exports.updateProfileSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(50)
        .optional(),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
        .optional()
        .messages({ 'string.pattern.base': 'Password must contain at least one letter and one number' }),
    full_name: Joi.string()
        .min(2)
        .max(100)
        .optional(),
    email: Joi.string()
        .email()
        .max(255)
        .optional()
}).min(1);

exports.avatarSchema = Joi.object({
    imageUrl: Joi.string()
        .uri({ scheme: ['https'] })
        .max(2048)
        .required()
        .messages({ 'string.uri': 'Image URL must be a valid HTTPS URL' })
});

exports.lookupAccountSchema = Joi.object({
    account_number: Joi.string()
        .pattern(/^\d{8}$/)
        .required()
        .messages({ 'string.pattern.base': 'Account number must be exactly 8 digits' })
});

exports.transferSchema = Joi.object({
    from_account_id: Joi.string()
        .uuid()
        .required()
        .messages({ 'string.guid': 'Invalid source account ID' }),
    to_account_id: Joi.string()
        .uuid()
        .required()
        .messages({ 'string.guid': 'Invalid destination account ID' }),
    amount: Joi.number()
        .positive()
        .precision(2)
        .max(100000)
        .required()
        .messages({
            'number.positive': 'Amount must be greater than zero',
            'number.max': 'Transfer limit is £100,000 per transaction'
        }),
    description: Joi.string()
        .max(255)
        .required()
});
