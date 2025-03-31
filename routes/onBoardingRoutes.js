const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onBoardingController');
const auth = require('../middleware/auth');

// ✅ Validadores externos
const {
  validatePersonalData,
  validateCompanyData
} = require('../validators/onboardinValidators');

// PUT - Datos personales del usuario
router.put('/personal', auth, validatePersonalData, onboardingController.onboardingPersonal);

// PATCH - Datos de la compañía del usuario
router.patch('/company', auth, validateCompanyData, onboardingController.onboardingCompany);

module.exports = router;
