const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  compania: { type: mongoose.Schema.Types.ObjectId, ref: 'Compania' },
  archivado: { type: Boolean, default: false },
  eliminado: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
