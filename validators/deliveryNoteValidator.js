// validators/deliveryNoteValidator.js
const { body } = require('express-validator');

const validarAlbaran = [
  body('numero')
    .notEmpty().withMessage('El número del albarán es obligatorio.')
    .isString().withMessage('El número debe ser una cadena de texto.'),

  body('fecha')
    .notEmpty().withMessage('La fecha del albarán es obligatoria.')
    .isISO8601().withMessage('La fecha debe tener un formato válido.'),

  body('cliente')
    .notEmpty().withMessage('El ID del cliente es obligatorio.')
    .isMongoId().withMessage('El ID del cliente debe ser válido.'),

  body('proyecto')
    .notEmpty().withMessage('El ID del proyecto es obligatorio.')
    .isMongoId().withMessage('El ID del proyecto debe ser válido.'),

  body('total')
    .notEmpty().withMessage('El total es obligatorio.')
    .isNumeric().withMessage('El total debe ser un número.'),

  body('horas')
    .optional()
    .isArray().withMessage('Las horas deben estar en un array.'),

  body('materiales')
    .optional()
    .isArray().withMessage('Los materiales deben estar en un array.')
];

module.exports = {
  validarAlbaran
};
