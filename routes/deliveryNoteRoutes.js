const express = require('express');
const { crearAlbaran } = require('../controllers/deliveryNoteController');
const validarJWT = require('../middleware/auth');
const { listarAlbaranes } = require('../controllers/deliveryNoteController');
const { obtenerAlbaranPorId } = require('../controllers/deliveryNoteController');
const { eliminarAlbaran } = require('../controllers/deliveryNoteController');
const { generarPdfAlbaran } = require('../controllers/deliveryNoteController');
const { firmarAlbaran } = require('../controllers/deliveryNoteController');
const uploadFirma = require('../middleware/uploadFirma');
const router = express.Router();

// Crear albarán
router.post('/', validarJWT, crearAlbaran);
// Listar todos los albaranes
router.get('/', validarJWT, listarAlbaranes);
// Obtener un albarán por ID
router.get('/:id', validarJWT, obtenerAlbaranPorId);
// Eliminar un albarán por ID
router.delete('/:id', validarJWT, eliminarAlbaran);
// Generar PDF
router.get('/pdf/:id', validarJWT, generarPdfAlbaran);
// Firmar albarán
router.patch('/firmar/:id', validarJWT, uploadFirma.single('firma'), firmarAlbaran);


module.exports = router;
