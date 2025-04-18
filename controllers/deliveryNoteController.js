const DeliveryNote = require('../models/DeliveryNote');
const Project = require('../models/Project');
const Cliente = require('../models/Cliente');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('../utils/ipfs');

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

const obtenerAlbaranPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const albaran = await DeliveryNote.findById(id)
      .populate('usuario', 'name email company') // ← Asegúrate que traemos 'company'
      .populate('cliente')
      .populate('proyecto');

    if (!albaran) {
      return res.status(404).json({ mensaje: 'Albarán no encontrado' });
    }

    if (!albaran.usuario) {
      return res.status(500).json({ mensaje: 'El albarán no tiene usuario asignado' });
    }

    const esPropietario = albaran.usuario._id.toString() === req.user.id;
    const esGuestMismaEmpresa = req.user.role === 'guest' &&
      req.user.company?.toString() === albaran.usuario.company?.toString();

    if (!esPropietario && !esGuestMismaEmpresa) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este albarán' });
    }

    res.json(albaran);
  } catch (error) {
    next(error);
  }
};

const eliminarAlbaran = async (req, res, next) => {
  try {
    const { id } = req.params;

    const albaran = await DeliveryNote.findById(id);

    if (!albaran) {
      return res.status(404).json({ mensaje: 'Albarán no encontrado' });
    }

    if (albaran.firmado) {
      return res.status(403).json({ mensaje: 'No se puede eliminar un albarán firmado' });
    }

    await albaran.deleteOne();

    res.json({ mensaje: 'Albarán eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

const generarPdfAlbaran = async (req, res, next) => {
  try {
    const { id } = req.params;

    const albaran = await DeliveryNote.findById(id)
      .populate('usuario', 'name email company')
      .populate('cliente')
      .populate('proyecto');

    if (!albaran) {
      return res.status(404).json({ mensaje: 'Albarán no encontrado' });
    }

    if (!albaran.usuario) {
      return res.status(500).json({ mensaje: 'El albarán no tiene usuario asignado' });
    }

    // Permisos
    const esPropietario = albaran.usuario._id.toString() === req.user.id;
    const esGuestMismaEmpresa = req.user.role === 'guest' &&
      req.user.company?.toString() === albaran.usuario.company?.toString();

    if (!esPropietario && !esGuestMismaEmpresa) {
      return res.status(403).json({ mensaje: 'No tienes permiso para descargar este albarán' });
    }

    // Generar PDF
    const doc = new PDFDocument();
    const filename = `albaran_${albaran.numero}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Template simple (puedes mejorarlo)
    doc.fontSize(20).text('Albarán', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Número: ${albaran.numero}`);
    doc.text(`Fecha: ${new Date(albaran.fecha).toLocaleDateString()}`);
    doc.text(`Usuario: ${albaran.usuario.name} (${albaran.usuario.email})`);
    doc.text(`Cliente: ${albaran.cliente.nombre || albaran.cliente.razonSocial || ''}`);
    doc.text(`Proyecto: ${albaran.proyecto.nombre || ''}`);
    doc.text(`Total: ${albaran.total} €`);

    doc.moveDown().fontSize(14).text('Horas:', { underline: true });
    if (albaran.horas && albaran.horas.length) {
      albaran.horas.forEach((h, i) => {
        doc.fontSize(12).text(
          `- ${h.persona ? h.persona.toString() : 'Desconocido'}: ${h.horasTrabajadas} horas`
        );
      });
    } else {
      doc.fontSize(12).text('No hay horas registradas.');
    }

    doc.moveDown().fontSize(14).text('Materiales:', { underline: true });
    if (albaran.materiales && albaran.materiales.length) {
      albaran.materiales.forEach((m, i) => {
        doc.fontSize(12).text(`- ${m.material}: ${m.cantidad}`);
      });
    } else {
      doc.fontSize(12).text('No hay materiales registrados.');
    }

    doc.moveDown();
    doc.fontSize(12).text(
      `Estado: ${albaran.firmado ? 'FIRMADO' : 'NO FIRMADO'}`
    );

    // Si está firmado y hay firma, añade nota
    if (albaran.firmado && albaran.firmaUrl) {
      doc.moveDown().fontSize(12).text('Albarán firmado digitalmente.');
      // Aquí puedes incluso insertar una imagen de la firma si quieres:
      // doc.image('ruta_firma.png', { width: 100 });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};



const firmarAlbaran = async (req, res, next) => {
  try {
    const { id } = req.params;

    const albaran = await DeliveryNote.findById(id);
    if (!albaran) {
      return res.status(404).json({ mensaje: 'Albarán no encontrado' });
    }

    if (albaran.firmado) {
      return res.status(400).json({ mensaje: 'Este albarán ya está firmado' });
    }

    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se ha subido ninguna firma' });
    }

    const firmaFile = req.file.filename;
    const firmaUrl = `${req.protocol}://${req.get('host')}/uploads/firmas/${firmaFile}`;

    albaran.firmado = true;
    albaran.firmaUrl = firmaUrl;
    albaran.fechaFirma = new Date();

    await albaran.save();

    res.json({
      msg: '✅ Albarán firmado correctamente',
      firmaUrl
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearAlbaran,
  listarAlbaranes,
  obtenerAlbaranPorId,
  eliminarAlbaran,
  generarPdfAlbaran,
  firmarAlbaran
};
