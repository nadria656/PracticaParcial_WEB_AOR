const Cliente = require('../models/Cliente');

// Crear un nuevo cliente
const crearCliente = async (req, res, next) => {
  try {
    const { nombre, cif, direccion } = req.body;
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const yaExiste = await Cliente.findOne({
      nombre,
      $or: [{ usuario: usuarioId }, { compania: companiaId }],
      eliminado: false,
    });

    if (yaExiste) {
      return res.status(409).json({ msg: 'El cliente ya existe para este usuario o su compañía.' });
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
    console.error('[crearCliente] Error al crear cliente:', error);
    res.status(500).json({ msg: 'Error interno al crear cliente.', error });
  }
};

// Actualizar un cliente existente
const actualizarCliente = async (req, res, next) => {
  try {
    const clienteId = req.params.id;
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;
    const { nombre, cif, direccion } = req.body;

    const cliente = await Cliente.findOne({
      _id: clienteId,
      eliminado: false,
      $or: [{ usuario: usuarioId }, { compania: companiaId }]
    });

    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado o sin permisos para modificarlo.' });
    }

    if (nombre !== undefined) cliente.nombre = nombre;
    if (cif !== undefined) cliente.cif = cif;
    if (direccion !== undefined) cliente.direccion = direccion;

    const actualizado = await cliente.save();

    res.json({ msg: 'Cliente actualizado correctamente.', cliente: actualizado });

  } catch (error) {
    console.error('[actualizarCliente] Error al actualizar cliente:', error);
    res.status(500).json({ msg: 'Error interno al actualizar cliente.', error });
  }
};


// Obtener todos los clientes del usuario o su compañía
const obtenerClientes = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const clientes = await Cliente.find({
      eliminado: false,
      $or: [{ usuario: usuarioId }, { compania: companiaId }]
    });

    res.json(clientes);

  } catch (error) {
    console.error('[obtenerClientes] Error al obtener clientes:', error);
    res.status(500).json({ msg: 'Error interno al obtener clientes.', error });
  }
};

// Obtener un cliente por ID
const obtenerClientePorId = async (req, res, next) => {
  try {
    const clienteId = req.params.id;
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const cliente = await Cliente.findOne({
      _id: clienteId,
      eliminado: false,
      $or: [{ usuario: usuarioId }, { compania: companiaId }]
    });

    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado o acceso denegado.' });
    }

    res.json(cliente);

  } catch (error) {
    console.error('[obtenerClientePorId] Error al obtener cliente por ID:', error);
    res.status(500).json({ msg: 'Error interno al obtener cliente.', error });
  }
};

// Archivar un cliente (soft delete)
const archivarCliente = async (req, res, next) => {
  try {
    const clienteId = req.params.id;
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const cliente = await Cliente.findOneAndUpdate(
      {
        _id: clienteId,
        eliminado: false,
        $or: [{ usuario: usuarioId }, { compania: companiaId }]
      },
      { archivado: true },
      { new: true }
    );

    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado o sin permiso para archivarlo.' });
    }

    res.json({ msg: 'Cliente archivado correctamente.', cliente });

  } catch (error) {
    console.error('[archivarCliente] Error al archivar cliente:', error);
    res.status(500).json({ msg: 'Error interno al archivar cliente.', error });
  }
};

// Eliminar un cliente (soft o hard delete)
const eliminarCliente = async (req, res, next) => {
  try {
    const clienteId = req.params.id;
    const softDelete = req.query.soft !== 'false'; // por defecto true
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const cliente = await Cliente.findOne({
      _id: clienteId,
      eliminado: false,
      $or: [{ usuario: usuarioId }, { compania: companiaId }]
    });

    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado o sin permisos para eliminarlo.' });
    }

    if (softDelete) {
      cliente.archivado = true;
      await cliente.save();
      return res.json({ msg: 'Cliente archivado correctamente (soft delete).' });
    } else {
      cliente.eliminado = true;
      await cliente.save();
      return res.json({ msg: 'Cliente eliminado definitivamente (hard delete).' });
    }

  } catch (error) {
    console.error('[eliminarCliente] Error al eliminar cliente:', error);
    res.status(500).json({ msg: 'Error interno al eliminar cliente.', error });
  }
};

// Recuperar un cliente archivado
const recuperarCliente = async (req, res, next) => {
  try {
    const clienteId = req.params.id;
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const cliente = await Cliente.findOneAndUpdate(
      {
        _id: clienteId,
        eliminado: false,
        archivado: true,
        $or: [{ usuario: usuarioId }, { compania: companiaId }]
      },
      { archivado: false },
      { new: true }
    );

    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente no encontrado o no está archivado.' });
    }

    res.json({ msg: 'Cliente recuperado correctamente.', cliente });

  } catch (error) {
    console.error('[recuperarCliente] Error al recuperar cliente:', error);
    res.status(500).json({ msg: 'Error interno al recuperar cliente.', error });
  }
};

// Listar clientes archivados
const listarClientesArchivados = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const companiaId = req.user.company || null;

    const clientesArchivados = await Cliente.find({
      archivado: true,
      eliminado: false,
      $or: [{ usuario: usuarioId }, { compania: companiaId }]
    });

    res.json(clientesArchivados);
  } catch (error) {
    console.error('[listarClientesArchivados] Error al listar clientes archivados:', error);
    res.status(500).json({ msg: 'Error interno al listar clientes archivados.', error });
  }
};


module.exports = {
  crearCliente,
  actualizarCliente,
  obtenerClientes,
  obtenerClientePorId,
  archivarCliente,
  eliminarCliente,
  recuperarCliente,
  listarClientesArchivados,
};
