const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Gestión de Usuarios',
    version: '1.0.0',
    description: 'Documentación de la API para gestión de usuarios, empresas, invitaciones, etc.',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: 'Calle Luna, 5' },
          postalCode: { type: 'string', example: '41010' },
          city: { type: 'string', example: 'Sevilla' },
          province: { type: 'string', example: 'Sevilla' }
        },
        required: ['street', 'postalCode', 'city', 'province']
      },
      PersonalData: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Juan' },
          surnames: { type: 'string', example: 'El Flama' },
          nif: { type: 'string', example: '12345678Z' },
          phone: { type: 'string', example: '+34600111222' },
          address: { $ref: '#/components/schemas/Address' }
        },
        required: ['name', 'surnames', 'nif', 'phone', 'address']
      },
      CompanyData: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Gitano S.L.' },
          cif: { type: 'string', example: 'B12345678' },
          address: { $ref: '#/components/schemas/Address' }
        },
        required: ['name', 'cif', 'address']
      },
      LoginData: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'juan@flama.com' },
          password: { type: 'string', example: 'contraseñaSegura123' }
        },
        required: ['email', 'password']
      },
      EmailOnly: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'juan@flama.com' }
        },
        required: ['email']
      },
      CodeOnly: {
        type: 'object',
        properties: {
          code: { type: 'string', example: '123456' }
        },
        required: ['code']
      },
      ResetPassword: {
        type: 'object',
        properties: {
          code: { type: 'string', example: '123456' },
          newPassword: { type: 'string', example: 'nuevaContraseña123' }
        },
        required: ['code', 'newPassword']
      }
    }
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './routes/onboardingRoutes.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
