const DeliveryNote = require('../models/DeliveryNote');
const Project = require('../models/Project');
const Cliente = require('../models/Cliente');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('../utils/ipfs');
const { generatePdf } = require('../utils/pdfGenerator'); 

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

    const esPropietario = albaran.usuario._id.toString() === req.user.id;
    const esGuestMismaEmpresa = req.user.role === 'guest' &&
      req.user.company?.toString() === albaran.usuario.company?.toString();

    if (!esPropietario && !esGuestMismaEmpresa) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este albarán' });
    }

    // 🔁 Si ya tiene PDF generado (albarán firmado)
    if (albaran.pdfUrl) {
      return res.json({
        mensaje: '✅ PDF ya generado',
        pdfUrl: albaran.pdfUrl
      });
    }

    // Generar PDF
    const fileName = `albaran_${albaran.numero}.pdf`;
    const pdfDir = path.join(__dirname, '../uploads/pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

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
        doc.fontSize(12).text(`- ${h.persona ? h.persona.toString() : 'Desconocido'}: ${h.horasTrabajadas} horas`);
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
    doc.fontSize(12).text(`Estado: ${albaran.firmado ? 'FIRMADO' : 'NO FIRMADO'}`);

    if (albaran.firmado && albaran.firmaUrl) {
      const firmaPath = path.join(__dirname, '../uploads/firmas', path.basename(albaran.firmaUrl));
      if (fs.existsSync(firmaPath)) {
        doc.moveDown().fontSize(12).text('Firma digital:');
        doc.image(firmaPath, { width: 100 });
      } else {
        doc.moveDown().text('Firma digital no disponible (archivo no encontrado).');
      }
    }

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/pdfs/${fileName}`;

    // Guardar pdfUrl si ya está firmado
    if (albaran.firmado && !albaran.pdfUrl) {
      albaran.pdfUrl = pdfUrl;
      await albaran.save();
    }

    res.json({
      mensaje: '✅ PDF generado correctamente',
      pdfUrl
    });

  } catch (error) {
    next(error);
  }
};




const firmarAlbaran = async (req, res, next) => {
  try {
    const { id } = req.params;
    const albaran = await DeliveryNote.findById(id)
      .populate('usuario')
      .populate('cliente')
      .populate('proyecto');

    if (!albaran) return res.status(404).json({ mensaje: 'Albarán no encontrado' });
    if (albaran.firmado) return res.status(400).json({ mensaje: 'Ya está firmado' });
    if (!req.file) return res.status(400).json({ mensaje: 'No se ha subido ninguna firma' });

    const firmaFile = req.file.filename;
    const firmaUrl = `${req.protocol}://${req.get('host')}/uploads/firmas/${firmaFile}`;

    // Marcar como firmado
    albaran.firmado = true;
    albaran.firmaUrl = firmaUrl;
    albaran.fechaFirma = new Date();

    // 🔨 Generar PDF temporal con firma
    const pdfPath = await generatePdf(albaran); // genera PDF con firma

    // 🔼 Subir PDF a "cloud"
    const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/pdfs/${path.basename(pdfPath)}`;
    albaran.pdfUrl = pdfUrl;

    await albaran.save();

    res.json({
      msg: '✅ Albarán firmado correctamente',
      firmaUrl,
      pdfUrl
    });
  } catch (error) {
    next(error);
  }
};

const descargarPdfDesdeCloud = async (req, res, next) => {
  try {
    const { id } = req.params;
    const albaran = await DeliveryNote.findById(id);

    if (!albaran) return res.status(404).json({ mensaje: 'Albarán no encontrado' });

    if (albaran.pdfUrl) {
      return res.redirect(albaran.pdfUrl); // redirige al PDF subido
    }

    return res.status(404).json({ mensaje: 'PDF no disponible en la nube' });
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
  firmarAlbaran,
  descargarPdfDesdeCloud
};
