const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onBoardingController');
const auth = require('../middleware/auth');

const {
  validatePersonalData,
  validateCompanyData
} = require('../validators/onboardinValidators');

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: Endpoints del proceso de onboarding del usuario
 */

/**
 * @swagger
 * /onboarding/personal:
 *   put:
 *     summary: Guardar o actualizar los datos personales del usuario
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PersonalData'
 *     responses:
 *       200:
 *         description: Datos personales guardados correctamente
 */
router.put('/personal', auth, validatePersonalData, onboardingController.onboardingPersonal);

/**
 * @swagger
 * /onboarding/company:
 *   patch:
 *     summary: Guardar o actualizar los datos de la compañía
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyData'
 *     responses:
 *       200:
 *         description: Datos de la compañía guardados correctamente
 */
router.patch('/company', auth, validateCompanyData, onboardingController.onboardingCompany);

module.exports = router;
