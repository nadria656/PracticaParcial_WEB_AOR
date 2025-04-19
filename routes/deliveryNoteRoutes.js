const express = require('express');
const { 
  crearAlbaran,
  listarAlbaranes,
  obtenerAlbaranPorId,
  eliminarAlbaran,
  generarPdfAlbaran,
  firmarAlbaran,
  descargarPdfDesdeCloud 
} = require('../controllers/deliveryNoteController');

const validarJWT = require('../middleware/auth');
const uploadFirma = require('../middleware/uploadFirma');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Endpoints para gestión de albaranes
 */

/**
 * @swagger
 * /deliverynote:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNoteData'
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 */
router.post('/', validarJWT, crearAlbaran);

/**
 * @swagger
 * /deliverynote:
 *   get:
 *     summary: Listar todos los albaranes
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get('/', validarJWT, listarAlbaranes);

/**
 * @swagger
 * /deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán obtenido correctamente
 */
router.get('/:id', validarJWT, obtenerAlbaranPorId);

/**
 * @swagger
 * /deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado correctamente
 */
router.delete('/:id', validarJWT, eliminarAlbaran);

/**
 * @swagger
 * /deliverynote/pdf/{id}:
 *   get:
 *     summary: Generar el PDF de un albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado correctamente
 */
router.get('/pdf/:id', validarJWT, generarPdfAlbaran);

/**
 * @swagger
 * /deliverynote/firmar/{id}:
 *   patch:
 *     summary: Firmar un albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firma:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 */
router.patch('/firmar/:id', validarJWT, uploadFirma.single('firma'), firmarAlbaran);

/**
 * @swagger
 * /deliverynote/cloud/{id}:
 *   get:
 *     summary: Descargar el PDF desde la nube
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirección al PDF almacenado en la nube
 */
router.get('/cloud/:id', validarJWT, descargarPdfDesdeCloud);

module.exports = router;
