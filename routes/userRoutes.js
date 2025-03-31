const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../uploads/logoUpload');

// Importamos los validadores desde la carpeta validators
const {
  validateRegister,
  validateLogin,
  validateCode,
  validateForgotPassword,
  validateResetPassword,
  validateInvite
} = require('../validators/userValidators');

// 🔐 Registro
router.post('/register', validateRegister, userController.register);

// 🧾 Validación del código recibido por correo
router.put('/validation', validateCode, userController.validateEmail);

// 🔓 Login
router.post('/login', validateLogin, userController.login);

// 🔃 Subida de logo
router.patch('/logo', auth, upload.single('logo'), userController.uploadLogo);

// 👤 Perfil
router.get('/me', auth, userController.getProfile);

// 🗑️ Eliminación de cuenta
router.delete('/', auth, userController.deleteUser);

// 🔁 Recuperación de contraseña
router.post('/forgot-password', validateForgotPassword, userController.forgotPassword);
router.post('/reset-password', validateResetPassword, userController.resetPassword);

// 📩 Invitación de usuarios
router.post('/invite', auth, validateInvite, userController.inviteUser);

module.exports = router;
