const express = require('express');
const router = express.Router();
const { crearProyecto } = require('../controllers/projectController');
const validarJWT = require('../middleware/auth');
const { actualizarProyecto } = require('../controllers/projectController');
const { listarProyectos } = require('../controllers/projectController');
const { obtenerProyectoPorId } = require('../controllers/projectController');
const { eliminarProyecto } = require('../controllers/projectController');
const { recuperarProyectoArchivado } = require('../controllers/projectController');
const { listarProyectosArchivados } = require('../controllers/projectController');


//Ruta para listar los proyectos archivados
router.get('/archived', validarJWT, listarProyectosArchivados); 
// Ruta para crear un proyecto
router.post('/', validarJWT, crearProyecto);
// Ruta para actualizar un proyecto
router.put('/:id', validarJWT, actualizarProyecto);
// Listar proyectos
router.get('/', validarJWT, listarProyectos);
// Obtener un proyecto por ID
router.get('/:id', validarJWT, obtenerProyectoPorId);
// Eliminar un proyecto (soft o hard)
router.delete('/:id', validarJWT, eliminarProyecto);
// Ruta para recuperar un proyecto archivado
router.patch('/recover/:id', validarJWT, recuperarProyectoArchivado);  

module.exports = router;
