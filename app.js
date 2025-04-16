const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/mongo');
const userRoutes = require('./routes/userRoutes');
const onboardingRoutes = require('./routes/onBoardingRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swaggerConfig');
const clientRoutes = require('./routes/clientRoutes'); 
const projectRoutes = require('./routes/projectRoutes');

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
app.use('/api/client', clientRoutes); 
app.use('/api/project', projectRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/uploads', express.static('uploads'));

// Determinamos el puerto según el entorno (si es test, usamos otro puerto)
const PORT = process.env.PORT || (process.env.NODE_ENV === 'test' ? 4001 : 3000);

// El servidor no se inicia aquí
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;  // Exportamos la app para usarla en los tests
