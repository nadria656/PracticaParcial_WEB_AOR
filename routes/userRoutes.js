const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../uploads/logoUpload');

const {
  validateRegister,
  validateLogin,
  validateCode,
  validateForgotPassword,
  validateResetPassword,
  validateInvite
} = require('../validators/userValidators');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints relacionados con usuarios
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginData'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 */
router.post('/register', validateRegister, userController.register);

/**
 * @swagger
 * /user/validation:
 *   put:
 *     summary: Validar email mediante código
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CodeOnly'
 *     responses:
 *       200:
 *         description: Email validado correctamente
 */
router.put('/validation', validateCode, userController.validateEmail);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginData'
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente
 */
router.post('/login', validateLogin, userController.login);

/**
 * @swagger
 * /user/logo:
 *   patch:
 *     summary: Subir o actualizar logo de la compañía
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo subido correctamente
 */
router.patch('/logo', auth, upload.single('logo'), userController.uploadLogo);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get('/me', auth, userController.getProfile);

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Eliminar cuenta de usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete('/', auth, userController.deleteUser);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailOnly'
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 */
router.post('/forgot-password', validateForgotPassword, userController.forgotPassword);

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Resetear contraseña con código
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.post('/reset-password', validateResetPassword, userController.resetPassword);

/**
 * @swagger
 * /user/invite:
 *   post:
 *     summary: Invitar a otro usuario a una compañía
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailOnly'
 *     responses:
 *       200:
 *         description: Invitación enviada
 */
router.post('/invite', auth, validateInvite, userController.inviteUser);

module.exports = router;
