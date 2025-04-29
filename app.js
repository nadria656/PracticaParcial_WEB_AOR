const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/mongo');
const userRoutes = require('./routes/userRoutes');
const onboardingRoutes = require('./routes/onBoardingRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const deliveryNoteRoutes = require('./routes/deliveryNoteRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swaggerConfig');
const morganBody = require('morgan-body');
const { IncomingWebhook } = require('@slack/webhook');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Conexión MongoDB
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar el webhook de Slack solo si existe la variable
if (process.env.SLACK_WEBHOOK_URL) {
  const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

  const loggerStream = {
    write: (message) => {
      webHook.send({ text: message });
    }
  };

  morganBody(app, {
    noColors: true,
    skip: function (req, res) {
      return res.statusCode < 400;
    },
    stream: loggerStream
  });
}

// Rutas
app.use('/api/user', userRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de manejo de errores 
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
