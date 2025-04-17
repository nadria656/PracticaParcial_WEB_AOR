const express = require('express');
const { crearAlbaran } = require('../controllers/deliveryNoteController');
const validarJWT = require('../middleware/auth');
const { listarAlbaranes } = require('../controllers/deliveryNoteController');


const router = express.Router();

// Ruta para crear un albarán
router.post('/', validarJWT, crearAlbaran);
// Ruta para listar albaranes
router.get('/', validarJWT, listarAlbaranes);


module.exports = router;
