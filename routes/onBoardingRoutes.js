const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const onboardingController = require('../controllers/onBoardingController');
const auth = require('../middleware/auth');

// PUT - Datos personales del usuario
router.put('/personal', auth, [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('surname').notEmpty().withMessage('Los apellidos son obligatorios'),
  body('nif').notEmpty().withMessage('El NIF es obligatorio')
], onboardingController.onboardingPersonal);

// PATCH - Datos de la compañía del usuario
router.patch('/company', auth, [
  body('isFreelance').isBoolean().withMessage('El campo isFreelance debe ser true o false'),
  body('name').optional().isString().withMessage('Nombre inválido'),
  body('cif').optional().isString().withMessage('CIF inválido'),
  body('address').optional().isString().withMessage('Dirección inválida')
], onboardingController.onboardingCompany);

module.exports = router;
