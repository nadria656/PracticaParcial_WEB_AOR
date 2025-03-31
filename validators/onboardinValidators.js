const { body } = require('express-validator');

const validatePersonalData = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('surname').notEmpty().withMessage('Los apellidos son obligatorios'),
  body('nif').notEmpty().withMessage('El NIF es obligatorio')
];

const validateCompanyData = [
  body('isFreelance').isBoolean().withMessage('El campo isFreelance debe ser true o false'),
  body('name').optional().isString().withMessage('Nombre inválido'),
  body('cif').optional().isString().withMessage('CIF inválido'),
  body('address').optional().isString().withMessage('Dirección inválida')
];

module.exports = {
  validatePersonalData,
  validateCompanyData
};
