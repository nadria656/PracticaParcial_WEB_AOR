const express = require('express');
const router = express.Router();
const validarJWT = require('../middleware/auth');
const { validarProyecto } = require('../validators/projectValidator');

const {
  crearProyecto,
  actualizarProyecto,
  listarProyectos,
  obtenerProyectoPorId,
  eliminarProyecto,
  recuperarProyectoArchivado,
  listarProyectosArchivados
} = require('../controllers/projectController');

/**
 * @swagger
 * /project/archived:
 *   get:
 *     summary: Listar proyectos archivados
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get('/archived', validarJWT, listarProyectosArchivados);
/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Endpoints para gestión de proyectos
 */

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectData'
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 */
router.post('/', validarJWT, validarProyecto, crearProyecto);

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Listar todos los proyectos
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get('/', validarJWT, listarProyectos);

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 */
router.get('/:id', validarJWT, obtenerProyectoPorId);

/**
 * @swagger
 * /project/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectData'
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 */
router.put('/:id', validarJWT, actualizarProyecto);

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (hard delete o soft delete según lógica)
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto eliminado correctamente
 */
router.delete('/:id', validarJWT, eliminarProyecto);



/**
 * @swagger
 * /project/recover/{id}:
 *   patch:
 *     summary: Recuperar un proyecto archivado
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto recuperado correctamente
 */
router.patch('/recover/:id', validarJWT, recuperarProyectoArchivado);

module.exports = router;
