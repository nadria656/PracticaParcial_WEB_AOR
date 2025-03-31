const { body } = require('express-validator');

const validateRegister = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
];

const validateCode = [
  body('code')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
    .isNumeric().withMessage('El código debe ser numérico')
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Email inválido')
];

const validateResetPassword = [
  body('email').isEmail().withMessage('Email inválido'),
  body('code').notEmpty().withMessage('Código requerido'),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener mínimo 8 caracteres')
];

const validateInvite = [
  body('email').isEmail().withMessage('Email inválido')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCode,
  validateForgotPassword,
  validateResetPassword,
  validateInvite
};
