const express = require('express');
const router = express.Router();
const validarJWT = require('../middleware/auth');

const {
  crearProyecto,
  actualizarProyecto,
  listarProyectos,
  obtenerProyectoPorId,
  eliminarProyecto,
  recuperarProyectoArchivado,
  listarProyectosArchivados
} = require('../controllers/projectController');


router.get('/archived', validarJWT, listarProyectosArchivados);
router.patch('/recover/:id', validarJWT, recuperarProyectoArchivado);


router.post('/', validarJWT, crearProyecto);
router.get('/', validarJWT, listarProyectos);
router.get('/:id', validarJWT, obtenerProyectoPorId);
router.put('/:id', validarJWT, actualizarProyecto);
router.delete('/:id', validarJWT, eliminarProyecto);

module.exports = router;
