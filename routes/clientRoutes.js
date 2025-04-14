const express = require('express');
const router = express.Router();
const { crearCliente } = require('../controllers/clientController');
const { validarCliente } = require('../validators/clientValidator');
const validarJWT = require('../middleware/auth');
const { obtenerClientes } = require('../controllers/clientController');
const { obtenerClientePorId } = require('../controllers/clientController');
const { archivarCliente } = require('../controllers/clientController');
const { eliminarCliente } = require('../controllers/clientController');
const { recuperarCliente } = require('../controllers/clientController');



router.post('/', validarJWT, validarCliente, crearCliente);
router.get('/', validarJWT, obtenerClientes);
router.get('/:id', validarJWT, obtenerClientePorId);
router.patch('/archive/:id', validarJWT, archivarCliente);
router.delete('/:id', validarJWT, eliminarCliente);
router.patch('/recover/:id', validarJWT, recuperarCliente);







module.exports = router;
