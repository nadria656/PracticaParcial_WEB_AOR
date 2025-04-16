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
const morganBody = require('morgan-body'); // Usaremos morgan-body para capturar logs
const { IncomingWebhook } = require('@slack/webhook'); // Importamos IncomingWebhook

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

// Configurar el webhook de Slack
const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL); // Usamos la URL del Webhook de Slack

// Configurar morgan-body para capturar logs de 4XX y 5XX y enviarlos a Slack
const loggerStream = {
  write: (message) => {
    // Enviar el log a Slack
    webHook.send({
      text: message
    });
  }
};

// Configuramos morgan-body para que envíe los logs de los errores (4XX y 5XX) a Slack
morganBody(app, {
  noColors: true, // Limpiar los logs antes de enviarlos
  skip: function(req, res) {
    // Solo enviamos logs de errores (4XX y 5XX)
    return res.statusCode < 400;
  },
  stream: loggerStream
});

// El servidor no se inicia aquí
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;  // Exportamos la app para usarla en los tests
