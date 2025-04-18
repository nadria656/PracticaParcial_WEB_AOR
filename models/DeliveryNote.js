const mongoose = require('mongoose');

const deliveryNoteSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  fecha: { type: Date, required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  total: { type: Number, required: true },
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ← añadido este campo

  horas: [
    {
      persona: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      horasTrabajadas: { type: Number, required: true }
    }
  ],
  materiales: [
    {
      material: { type: String, required: true },
      cantidad: { type: Number, required: true }
    }
  ],

  firmado: { type: Boolean, default: false },
  firmaUrl: { type: String },
  pdfUrl: { type: String },  // URL del PDF subido a la nube
  fechaCreacion: { type: Date, default: Date.now },
  fechaFirma: { type: Date }
});

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);
