const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../uploads/logoUpload');


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

  
  router.patch('/logo', auth, upload.single('logo'), userController.uploadLogo);

  // GET  Obtener datos del usuario autenticado
  router.get('/me', auth, userController.getProfile);

  router.delete('/', auth, userController.deleteUser);

  module.exports = router;