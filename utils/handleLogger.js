const { IncomingWebhook } = require('@slack/webhook');

// Usamos el webhook de Slack desde la variable de entorno SLACK_WEBHOOK
const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

const loggerStream = {
  write: (message) => {
    // Enviar el mensaje a Slack
    webHook.send({
      text: message,
    }).catch(err => {
      // Captura de errores si la solicitud falla
      console.error('Error al enviar el mensaje a Slack:', err);
    });
  },
};

module.exports = loggerStream;
