const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cif: { type: String, required: true },
  direccion: {
    calle: String,
    ciudad: String,
    codigoPostal: String,
    pais: String,
  },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  compania: { type: mongoose.Schema.Types.ObjectId, ref: 'Compania' },
  eliminado: { type: Boolean, default: false },
  archivado: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema);
