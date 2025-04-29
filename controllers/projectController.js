const Project = require('../models/Project');
const Cliente = require('../models/Cliente');

// Crear un nuevo proyecto
const crearProyecto = async (req, res) => {
  try {
    const { nombre, descripcion, cliente, compania } = req.body;
    const usuarioId = req.user.id;

    const clienteExistente = await Cliente.findById(cliente);
    if (!clienteExistente) {
      return res.status(404).json({ msg: 'Cliente no encontrado.' });
    }

    const proyecto = new Project({
      nombre,
      descripcion,
      cliente,
      usuario: usuarioId,
      compania
    });

    const proyectoGuardado = await proyecto.save();
    res.status(201).json(proyectoGuardado);

  } catch (error) {
    console.error('[crearProyecto] Error al crear proyecto:', error);
    res.status(500).json({ msg: 'Error interno al crear proyecto.', error });
  }
};

// Actualizar un proyecto
const actualizarProyecto = async (req, res) => {
  try {
    const { nombre, descripcion, cliente, compania } = req.body;
    const proyectoId = req.params.id;

    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado.' });
    }

    proyecto.nombre = nombre || proyecto.nombre;
    proyecto.descripcion = descripcion || proyecto.descripcion;
    proyecto.cliente = cliente || proyecto.cliente;
    proyecto.compania = compania || proyecto.compania;

    await proyecto.save();

    res.json(proyecto);

  } catch (error) {
    console.error('[actualizarProyecto] Error al actualizar proyecto:', error);
    res.status(500).json({ msg: 'Error interno al actualizar proyecto.', error });
  }
};

// Listar todos los proyectos
const listarProyectos = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const proyectos = await Project.find({
      $or: [{ usuario: usuarioId }, { compania: req.user.company }],
      eliminado: false
    });

    res.json(proyectos);

  } catch (error) {
    console.error('[listarProyectos] Error al listar proyectos:', error);
    res.status(500).json({ msg: 'Error interno al listar proyectos.', error });
  }
};

// Obtener un proyecto por ID
const obtenerProyectoPorId = async (req, res) => {
  try {
    const proyecto = await Project.findOne({
      _id: req.params.id,
      eliminado: false
    });

    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado.' });
    }

    res.json(proyecto);

  } catch (error) {
    console.error('[obtenerProyectoPorId] Error al obtener proyecto:', error);
    res.status(500).json({ msg: 'Error interno al obtener proyecto.', error });
  }
};

// Eliminar (o archivar) un proyecto
const eliminarProyecto = async (req, res) => {
  try {
    const proyecto = await Project.findById(req.params.id);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado.' });
    }

    if (req.query.soft === 'false') {
      await Project.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Proyecto eliminado definitivamente (hard delete).' });
    } else {
      proyecto.archivado = true;
      await proyecto.save();
      res.json({ msg: 'Proyecto archivado correctamente.', proyecto });
    }

  } catch (error) {
    console.error('[eliminarProyecto] Error al eliminar proyecto:', error);
    res.status(500).json({ msg: 'Error interno al eliminar proyecto.', error });
  }
};

// Recuperar un proyecto archivado
const recuperarProyectoArchivado = async (req, res) => {
  try {
    const proyectoId = req.params.id;

    const proyecto = await Project.findOne({
      _id: proyectoId,
      archivado: true,
      eliminado: false
    });

    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado o no está archivado.' });
    }

    proyecto.archivado = false;
    await proyecto.save();

    res.json({ msg: 'Proyecto recuperado correctamente.', proyecto });

  } catch (error) {
    console.error('[recuperarProyectoArchivado] Error al recuperar proyecto:', error);
    res.status(500).json({ msg: 'Error interno al recuperar proyecto.', error });
  }
};

// Listar proyectos archivados
const listarProyectosArchivados = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const proyectos = await Project.find({
      $or: [{ usuario: usuarioId }, { compania: req.user.company }],
      archivado: true,
      eliminado: false
    });

    res.json(proyectos);

  } catch (error) {
    console.error('[listarProyectosArchivados] Error al listar proyectos archivados:', error);
    res.status(500).json({ msg: 'Error interno al listar proyectos archivados.', error });
  }
};

module.exports = {
  crearProyecto,
  actualizarProyecto,
  listarProyectos,
  obtenerProyectoPorId,
  eliminarProyecto,
  recuperarProyectoArchivado,
  listarProyectosArchivados
};
