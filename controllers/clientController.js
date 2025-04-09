const Cliente = require('../models/Cliente');

const crearCliente = async (req, res, next) => {
  try {
    const { nombre, cif, direccion } = req.body;
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    // Verificar si ya existe ese cliente para el usuario o su compañía
    const yaExiste = await Cliente.findOne({
      nombre,
      $or: [
        { usuario: usuarioId },
        { compania: companiaId },
      ],
      eliminado: false,
    });

    if (yaExiste) {
      return res.status(409).json({ mensaje: 'El cliente ya existe para este usuario o su compañía' });
    }

    const nuevoCliente = await Cliente.create({
      nombre,
      cif,
      direccion,
      usuario: usuarioId,
      compania: companiaId,
    });

    res.status(201).json(nuevoCliente);
  } catch (error) {
    next(error);
  }
};

const obtenerClientes = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const clientes = await Cliente.find({
      eliminado: false,
      $or: [
        { usuario: usuarioId },
        { compania: companiaId }
      ]
    });

    res.json(clientes);
  } catch (error) {
    next(error);
  }
};


const obtenerClientePorId = async (req, res, next) => {
    try {
      const clienteId = req.params.id;
      const usuarioId = req.user.id;
      const companiaId = req.user.company || null;
  
      const cliente = await Cliente.findOne({
        _id: clienteId,
        eliminado: false,
        $or: [
          { usuario: usuarioId },
          { compania: companiaId }
        ]
      });
  
      if (!cliente) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado o acceso denegado' });
      }
  
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  };
  

  const archivarCliente = async (req, res, next) => {
    try {
      const clienteId = req.params.id;
      const usuarioId = req.user.id;
      const companiaId = req.user.company || null;
  
      const cliente = await Cliente.findOneAndUpdate(
        {
          _id: clienteId,
          eliminado: false,
          $or: [
            { usuario: usuarioId },
            { compania: companiaId }
          ]
        },
        { archivado: true },
        { new: true }
      );
  
      if (!cliente) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado o sin permiso para archivarlo' });
      }
  
      res.json({ mensaje: 'Cliente archivado correctamente', cliente });
    } catch (error) {
      next(error);
    }
  };
  

  module.exports = {
    crearCliente,
    obtenerClientes,
    obtenerClientePorId,
    archivarCliente,
  };