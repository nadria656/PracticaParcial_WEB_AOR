const DeliveryNote = require('../models/DeliveryNote');
const Project = require('../models/Project');
const Cliente = require('../models/Cliente');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('../utils/ipfs');
const { generatePdf } = require('../utils/pdfGenerator');


// Crear un nuevo albarán
const crearAlbaran = async (req, res) => {
  try {
    const { numero, fecha, cliente, total, proyecto, horas, materiales } = req.body;
    const usuarioId = req.user.id;

    const proyectoExistente = await Project.findById(proyecto);
    if (!proyectoExistente) return res.status(404).json({ msg: 'Proyecto no encontrado.' });

    const clienteExistente = await Cliente.findById(cliente);
    if (!clienteExistente) return res.status(404).json({ msg: 'Cliente no encontrado.' });

    const albaran = new DeliveryNote({
      numero,
      fecha,
      cliente,
      total,
      proyecto,
      horas,
      materiales,
      usuario: usuarioId
    });

    const albaranGuardado = await albaran.save();
    res.status(201).json(albaranGuardado);

  } catch (error) {
    console.error('[crearAlbaran] Error al crear albarán:', error);
    res.status(500).json({ msg: 'Error interno al crear albarán.', error });
  }
};

// Listar todos los albaranes
const listarAlbaranes = async (req, res) => {
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
    console.error('[listarAlbaranes] Error al listar albaranes:', error);
    res.status(500).json({ msg: 'Error interno al listar albaranes.', error });
  }
};

// Obtener un albarán por ID
const obtenerAlbaranPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const albaran = await DeliveryNote.findById(id)
      .populate('usuario', 'name email company')
      .populate('cliente')
      .populate('proyecto');

    if (!albaran) return res.status(404).json({ msg: 'Albarán no encontrado.' });

    if (!albaran.usuario) return res.status(500).json({ msg: 'El albarán no tiene usuario asignado.' });

    const esPropietario = albaran.usuario._id.toString() === req.user.id;
    const esGuestMismaEmpresa = req.user.role === 'guest' &&
      req.user.company?.toString() === albaran.usuario.company?.toString();

    if (!esPropietario && !esGuestMismaEmpresa) {
      return res.status(403).json({ msg: 'No tienes permiso para ver este albarán.' });
    }

    res.json(albaran);

  } catch (error) {
    console.error('[obtenerAlbaranPorId] Error al obtener albarán:', error);
    res.status(500).json({ msg: 'Error interno al obtener albarán.', error });
  }
};

// Eliminar un albarán (solo si no está firmado)
const eliminarAlbaran = async (req, res) => {
  try {
    const { id } = req.params;
    const albaran = await DeliveryNote.findById(id);

    if (!albaran) return res.status(404).json({ msg: 'Albarán no encontrado.' });

    if (albaran.firmado) return res.status(403).json({ msg: 'No se puede eliminar un albarán firmado.' });

    await albaran.deleteOne();

    res.json({ msg: 'Albarán eliminado correctamente.' });

  } catch (error) {
    console.error('[eliminarAlbaran] Error al eliminar albarán:', error);
    res.status(500).json({ msg: 'Error interno al eliminar albarán.', error });
  }
};

const generarPdfAlbaran = async (req, res) => {
  try {
    const { id } = req.params;

    const albaran = await DeliveryNote.findById(id)
      .populate('usuario', 'name email company')
      .populate('cliente')
      .populate('proyecto');

    if (!albaran) return res.status(404).json({ msg: 'Albarán no encontrado.' });

    const esPropietario = albaran.usuario._id.toString() === req.user.id;
    const esGuestMismaEmpresa =
      req.user.role === 'guest' &&
      req.user.company?.toString() === albaran.usuario.company?.toString();

    if (!esPropietario && !esGuestMismaEmpresa) {
      return res.status(403).json({ msg: 'No tienes permiso para ver este albarán.' });
    }

    // Si ya tiene PDF en IPFS, devuélvelo directamente
    if (albaran.pdfUrl) {
      return res.json({ msg: 'PDF ya generado.', pdfUrl: albaran.pdfUrl });
    }

    // Generar PDF en local
    const fileName = `albaran_${albaran.numero}.pdf`;
    const pdfDir = path.join(__dirname, '../uploads/pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Contenido del PDF
    doc.fontSize(20).text('Albarán', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${albaran.numero}`);
    doc.text(`Fecha: ${new Date(albaran.fecha).toLocaleDateString()}`);
    doc.text(`Usuario: ${albaran.usuario.name}`);
    doc.text(`Cliente: ${albaran.cliente?.nombre || ''}`);
    doc.text(`Proyecto: ${albaran.proyecto?.nombre || ''}`);
    doc.text(`Total: ${albaran.total} €`);

    doc.moveDown().fontSize(14).text('Horas:', { underline: true });
    if (albaran.horas?.length) {
      albaran.horas.forEach(h => {
        doc.fontSize(12).text(`- ${h.persona || 'Desconocido'}: ${h.horasTrabajadas} horas`);
      });
    } else {
      doc.fontSize(12).text('No hay horas registradas.');
    }

    doc.moveDown().fontSize(14).text('Materiales:', { underline: true });
    if (albaran.materiales?.length) {
      albaran.materiales.forEach(m => {
        doc.fontSize(12).text(`- ${m.material}: ${m.cantidad}`);
      });
    } else {
      doc.fontSize(12).text('No hay materiales registrados.');
    }

    doc.moveDown();
    doc.fontSize(12).text(`Estado: ${albaran.firmado ? 'FIRMADO' : 'NO FIRMADO'}`);

    // Firma
    if (albaran.firmado && albaran.firmaUrl) {
      doc.moveDown().text('Firma digital: (ver en IPFS)');
    }

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Subir a IPFS
    const pdfIpfsUrl = await uploadToIPFS(pdfPath);

    // Guardar en el albarán
    albaran.pdfUrl = pdfIpfsUrl;
    await albaran.save();

    res.json({ msg: 'PDF generado correctamente y subido a IPFS.', pdfUrl: pdfIpfsUrl });

  } catch (error) {
    console.error('[generarPdfAlbaran] Error al generar PDF:', error);
    res.status(500).json({ msg: 'Error interno al generar PDF.', error });
  }
};

// Firmar un albarán
const firmarAlbaran = async (req, res) => {
  try {
    const { id } = req.params;

    const albaran = await DeliveryNote.findById(id)
      .populate('usuario')
      .populate('cliente')
      .populate('proyecto');

    if (!albaran) return res.status(404).json({ msg: 'Albarán no encontrado.' });
    if (albaran.firmado) return res.status(400).json({ msg: 'Ya está firmado.' });
    if (!req.file) return res.status(400).json({ msg: 'No se ha subido ninguna firma.' });

    const firmaFile = req.file.filename;
    const firmaPath = path.join(__dirname, '../uploads/firmas', firmaFile);


    const firmaIpfsUrl = await uploadToIPFS(firmaPath);


    albaran.firmado = true;
    albaran.firmaUrl = firmaIpfsUrl;
    albaran.fechaFirma = new Date();

    // 📄 Generar PDF firmado
    const pdfPath = await generatePdf(albaran); // PDF se genera y se guarda en disco

    // 🔼 Subir PDF a IPFS
    const pdfIpfsUrl = await uploadToIPFS(pdfPath);

    // Guardar url del PDF
    albaran.pdfUrl = pdfIpfsUrl;

    await albaran.save();

    res.json({
      msg: 'Albarán firmado correctamente.',
      firmaUrl: firmaIpfsUrl,
      pdfUrl: pdfIpfsUrl
    });

  } catch (error) {
    console.error('[firmarAlbaran] Error al firmar albarán:', error);
    res.status(500).json({ msg: 'Error interno al firmar albarán.', error });
  }
};

const descargarPdfDesdeCloud = async (req, res) => {
  try {
    const { id } = req.params;
    const albaran = await DeliveryNote.findById(id);

    if (!albaran) return res.status(404).json({ msg: 'Albarán no encontrado' });

    // Validación de acceso
    const esPropietario = albaran.usuario.toString() === req.user.id;
    const esGuestMismaEmpresa =
      req.user.role === 'guest' &&
      req.user.company?.toString() === albaran.usuario.company?.toString();

    if (!esPropietario && !esGuestMismaEmpresa) {
      return res.status(403).json({ msg: 'No tienes permiso para descargar este albarán' });
    }

    if (albaran.pdfUrl) {
      return res.redirect(albaran.pdfUrl);
    }

    return res.status(404).json({ msg: 'PDF no disponible en la nube (IPFS)' });

  } catch (error) {
    console.error('[descargarPdfDesdeCloud] Error:', error);
    res.status(500).json({ msg: 'Error al descargar el PDF desde la nube', error });
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
