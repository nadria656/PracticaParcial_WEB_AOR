// app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/mongo');
const userRoutes = require('./routes/userRoutes');
const onboardingRoutes = require('./routes/onBoardingRoutes');



dotenv.config();

const app = express();


// Conexión MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Rutas
app.use('/api/user', userRoutes);
app.use('/api/onboarding', onboardingRoutes);


app.use('/uploads', express.static('uploads'));


// Arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});