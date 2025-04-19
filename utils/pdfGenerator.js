const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePdf = async (albaran) => {
  const fileName = `albaran_${albaran.numero}.pdf`;
  const pdfDir = path.join(__dirname, '../uploads/pdfs');

  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  const pdfPath = path.join(pdfDir, fileName);
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  doc.fontSize(18).text('ALBARÁN', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Número: ${albaran.numero}`);
  doc.text(`Fecha: ${new Date(albaran.fecha).toLocaleDateString()}`);
  doc.text(`Cliente: ${albaran.cliente?.nombre || 'Sin nombre'}`);
  doc.text(`Proyecto: ${albaran.proyecto?.nombre || 'Sin nombre'}`);
  doc.text(`Total: ${albaran.total} €`);

  doc.moveDown().text('Horas:');
  albaran.horas?.forEach(h => {
    doc.text(`- ${h.persona}: ${h.horasTrabajadas}h`);
  });

  doc.moveDown().text('Materiales:');
  albaran.materiales?.forEach(m => {
    doc.text(`- ${m.material}: ${m.cantidad}`);
  });

  doc.moveDown().text(`Estado: ${albaran.firmado ? 'FIRMADO' : 'NO FIRMADO'}`);

  // 💥 Añadir firma si existe
  if (albaran.firmaUrl) {
    try {
      const imgPath = path.join(__dirname, '../uploads/firmas', path.basename(albaran.firmaUrl));
      if (fs.existsSync(imgPath)) {
        doc.moveDown().text('Firma:');
        doc.image(imgPath, { width: 100 });
      }
    } catch (e) {
      console.error('No se pudo cargar la imagen de firma:', e.message);
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(pdfPath));
    stream.on('error', reject);
  });
};

module.exports = { generatePdf };
