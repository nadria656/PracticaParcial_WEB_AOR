const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 🔐 POST - Registro de usuario
router.post('/register', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
  ], userController.register);
  
  // 🧾 PUT - Validación del código recibido por correo
  router.put('/validation', [
    body('code')
      .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
      .isNumeric().withMessage('El código debe ser numérico')
  ], userController.validateEmail);
  
  // 🔓 POST - Login
  router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida')
  ], userController.login);

  

  // 👤 PUT - Onboarding (datos personales)
router.put('/onboarding/personal', auth, [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('surname').notEmpty().withMessage('Los apellidos son obligatorios'),
  body('nif').notEmpty().withMessage('El NIF es obligatorio')
], userController.onboardingPersonal);


// 👤 PATCH  - Datos de la compañía
router.patch('/onboarding/company', auth, [
    body('isFreelance').isBoolean().withMessage('El campo isFreelance debe ser true o false'),
    body('name').optional().isString().withMessage('Nombre inválido'),
    body('cif').optional().isString().withMessage('CIF inválido'),
    body('address').optional().isString().withMessage('Dirección inválida')
  ], userController.onboardingCompany);
  
  module.exports = router;