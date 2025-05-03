const express = require('express');
const router = express.Router();
const { crearCliente } = require('../controllers/clientController');
const { validarCliente } = require('../validators/clientValidator');
const validarJWT = require('../middleware/auth');
const {
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente, // ✅ añadido aquí
  archivarCliente,
  eliminarCliente,
  recuperarCliente
} = require('../controllers/clientController');

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para gestión de clientes
 */

/**
 * @swagger
 * /client:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientData'
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 */
router.post('/', validarJWT, validarCliente, crearCliente);

/**
 * @swagger
 * /client:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', validarJWT, obtenerClientes);

/**
 * @swagger
 * /client/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 */
router.get('/:id', validarJWT, obtenerClientePorId);

/**
 * @swagger
 * /client/{id}:
 *   put:
 *     summary: Actualizar un cliente existente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientData'
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 */
router.put('/:id', validarJWT, validarCliente, actualizarCliente);

/**
 * @swagger
 * /client/archive/{id}:
 *   patch:
 *     summary: Archivar un cliente (soft delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a archivar
 *     responses:
 *       200:
 *         description: Cliente archivado correctamente
 */
router.patch('/archive/:id', validarJWT, archivarCliente);

/**
 * @swagger
 * /client/{id}:
 *   delete:
 *     summary: Eliminar cliente (hard delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a eliminar
 *     responses:
 *       200:
 *         description: Cliente eliminado definitivamente
 */
router.delete('/:id', validarJWT, eliminarCliente);

/**
 * @swagger
 * /client/recover/{id}:
 *   patch:
 *     summary: Recuperar cliente archivado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a recuperar
 *     responses:
 *       200:
 *         description: Cliente recuperado correctamente
 */
router.patch('/recover/:id', validarJWT, recuperarCliente);

module.exports = router;
