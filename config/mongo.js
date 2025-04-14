const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    
    // Solo mostrar el log si no estamos en el entorno de pruebas
    if (process.env.NODE_ENV !== 'test') {
      console.log('🟢 MongoDB conectado correctamente');
    }
  } catch (error) {
    console.error('🔴 Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
