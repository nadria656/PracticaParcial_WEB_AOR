const DeliveryNote = require('../models/DeliveryNote');
const Project = require('../models/Project');
const Cliente = require('../models/Cliente');
const User = require('../models/user');

const crearAlbaran = async (req, res, next) => {
  try {
    const { numero, fecha, cliente, total, proyecto, horas, materiales } = req.body;
    const usuarioId = req.user.id;  // Usuario autenticado

    // Verificar si el proyecto existe
    const proyectoExistente = await Project.findById(proyecto);
    if (!proyectoExistente) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    // Verificar si el cliente existe
    const clienteExistente = await Cliente.findById(cliente);
    if (!clienteExistente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Crear el albarán
    const albaran = new DeliveryNote({
      numero,
      fecha,
      cliente,
      total,
      proyecto,
      horas,
      materiales,
      usuario: usuarioId  // Asegúrate de que el usuario es el correcto
    });

    const albaranGuardado = await albaran.save();
    res.status(201).json(albaranGuardado);
  } catch (error) {
    next(error);
  }
};

const listarAlbaranes = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const albaranes = await DeliveryNote.find({
      $or: [
        { usuario: usuarioId },
        { compania: companiaId }
      ]
    }).sort({ fecha: -1 }); 

    res.json(albaranes);
  } catch (error) {
    next(error);
  }
};



module.exports = {
  crearAlbaran,
  listarAlbaranes,
};
