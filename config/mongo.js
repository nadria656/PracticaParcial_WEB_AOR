// config/mongo.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('🟢 MongoDB conectado correctamente');
  } catch (error) {
    console.error('🔴 Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
