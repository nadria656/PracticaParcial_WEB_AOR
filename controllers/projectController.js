const Project = require('../models/Project');
const Cliente = require('../models/Cliente');  // Importamos el modelo de Cliente

// Crear proyecto
const crearProyecto = async (req, res, next) => {
  try {
    const { nombre, descripcion, cliente, compania } = req.body;
    const usuarioId = req.user.id;  // Usuario autenticado

    // Verificar si el cliente existe
    const clienteExistente = await Cliente.findById(cliente);
    if (!clienteExistente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Crear el proyecto
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
    next(error);
  }
};



// Actualizar un proyecto
const actualizarProyecto = async (req, res, next) => {
  try {
    const { nombre, descripcion, cliente, compania } = req.body;
    const proyectoId = req.params.id;

    // Buscar el proyecto por ID
    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    // Actualizamos el proyecto con los nuevos datos
    proyecto.nombre = nombre || proyecto.nombre;
    proyecto.descripcion = descripcion || proyecto.descripcion;
    proyecto.cliente = cliente || proyecto.cliente;
    proyecto.compania = compania || proyecto.compania;

    // Guardamos el proyecto actualizado
    await proyecto.save();

    res.json(proyecto);
  } catch (error) {
    next(error);
  }
};

// Listar todos los proyectos
const listarProyectos = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;

    // Buscamos los proyectos que no están eliminados
    const proyectos = await Project.find({
      $or: [{ usuario: usuarioId }, { compania: req.user.company }],
      eliminado: false
    });

    // Si no hay proyectos
    if (proyectos.length === 0) {
      return res.status(404).json({ mensaje: 'No hay proyectos disponibles' });
    }

    // Si encontramos proyectos, los devolvemos
    res.json(proyectos);
  } catch (error) {
    next(error);  // Manejamos cualquier error
  }
};


// Obtener un proyecto por ID
const obtenerProyectoPorId = async (req, res, next) => {
  try {
    const proyecto = await Project.findOne({
      _id: req.params.id,
      eliminado: false
    });
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }
    res.json(proyecto);
  } catch (error) {
    next(error);
  }
};

// Eliminar un proyecto (hard/soft)
const eliminarProyecto = async (req, res, next) => {
  try {
    const proyecto = await Project.findById(req.params.id);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    if (req.query.soft === 'false') {
      // Eliminar el proyecto de manera definitiva (hard delete)
      await Project.findByIdAndDelete(req.params.id);  // Usamos findByIdAndDelete para eliminar el proyecto por ID
      res.json({ mensaje: 'Proyecto eliminado definitivamente (hard delete)' });
    } else {
      // Archivar el proyecto (soft delete)
      proyecto.archivado = true;
      await proyecto.save();
      res.json({ mensaje: 'Proyecto archivado correctamente', proyecto });
    }
  } catch (error) {
    next(error);
  }
};

// Recuperar un proyecto archivado (pasarlo a no borrado)
const recuperarProyectoArchivado = async (req, res, next) => {
  try {
    const proyectoId = req.params.id;

    // Buscar el proyecto archivado
    const proyecto = await Project.findOne({
      _id: proyectoId,
      archivado: true,  // Solo buscamos proyectos archivados
      eliminado: false
    });

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado o no está archivado' });
    }

    // Recuperar el proyecto (marcar como no archivado)
    proyecto.archivado = false;
    await proyecto.save();

    res.json({
      mensaje: 'Proyecto recuperado correctamente',
      proyecto
    });
  } catch (error) {
    next(error);  // Manejamos el error
  }
};

// Listar proyectos archivados
const listarProyectosArchivados = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;

    // Buscamos los proyectos archivados
    const proyectos = await Project.find({
      $or: [{ usuario: usuarioId }, { compania: req.user.company }],
      archivado: true,
      eliminado: false
    });

    // Si no hay proyectos archivados
    if (proyectos.length === 0) {
      return res.status(404).json({ mensaje: 'No hay proyectos archivados' });
    }

    // Si encontramos proyectos archivados, los devolvemos
    res.json(proyectos);
  } catch (error) {
    next(error);  // Si ocurre un error, lo manejamos
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
