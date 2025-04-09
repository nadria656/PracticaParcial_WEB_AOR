const { body } = require('express-validator');

const validarCliente = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('cif').notEmpty().withMessage('El CIF es obligatorio'),
  body('direccion.calle').notEmpty().withMessage('La calle es obligatoria'),
  body('direccion.ciudad').notEmpty().withMessage('La ciudad es obligatoria'),
  body('direccion.codigoPostal').notEmpty().withMessage('El código postal es obligatorio'),
  body('direccion.pais').optional()
];

module.exports = { validarCliente };
