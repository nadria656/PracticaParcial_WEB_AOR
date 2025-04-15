const Project = require('../models/Project');

// Crear un proyecto
const crearProyecto = async (req, res, next) => {
  try {
    const { nombre, descripcion, cliente, compania } = req.body;
    const usuarioId = req.user.id;  // Usuario autenticado

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
    const proyectos = await Project.find({
      $or: [{ usuario: usuarioId }, { compania: req.user.company }],
      eliminado: false
    });
    res.json(proyectos);
  } catch (error) {
    next(error);
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

module.exports = {
  crearProyecto,
  actualizarProyecto,
  listarProyectos,
  obtenerProyectoPorId,
  eliminarProyecto
};
