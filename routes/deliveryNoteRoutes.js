const express = require('express');
const { crearAlbaran } = require('../controllers/deliveryNoteController');
const validarJWT = require('../middleware/auth');
const { listarAlbaranes } = require('../controllers/deliveryNoteController');
const { obtenerAlbaranPorId } = require('../controllers/deliveryNoteController');
const { eliminarAlbaran } = require('../controllers/deliveryNoteController');
const { generarPdfAlbaran } = require('../controllers/deliveryNoteController');
const { firmarAlbaran } = require('../controllers/deliveryNoteController');
const { descargarPdfDesdeCloud } = require('../controllers/deliveryNoteController');
const uploadFirma = require('../middleware/uploadFirma');
const router = express.Router();

router.get('/pdf/:id', validarJWT, generarPdfAlbaran);
router.patch('/firmar/:id', validarJWT, uploadFirma.single('firma'), firmarAlbaran);
router.get('/cloud/:id', validarJWT, descargarPdfDesdeCloud);


router.post('/', validarJWT, crearAlbaran);
router.get('/', validarJWT, listarAlbaranes);
router.get('/:id', validarJWT, obtenerAlbaranPorId);
router.delete('/:id', validarJWT, eliminarAlbaran);

module.exports = router;
