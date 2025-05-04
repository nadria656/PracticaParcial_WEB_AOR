// validators/projectValidator.js
const { body } = require('express-validator');

const validarProyecto = [
    body('nombre')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio.')
        .isString().withMessage('El nombre debe ser una cadena de texto.'),

    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto.'),

    body('cliente')
        .notEmpty().withMessage('El cliente es obligatorio.')
        .isMongoId().withMessage('El ID del cliente debe ser válido.'),

    body('compania')
        .optional()
        .isMongoId().withMessage('El ID de la compañía debe ser válido.')
];

module.exports = {
    validarProyecto
};
