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
      ClientData: {
        type: 'object',
        properties: {
          nombre: { type: 'string', example: 'Ferretería El Gitano' },
          cif: { type: 'string', example: 'B12345678' },
          direccion: {
            type: 'object',
            properties: {
              calle: { type: 'string', example: 'Calle del Flamenco 7' },
              ciudad: { type: 'string', example: 'Triana' },
              codigoPostal: { type: 'string', example: '41010' },
              pais: { type: 'string', example: 'España' }
            }
          }
        },
        required: ['nombre', 'cif', 'direccion']
      },
      ProjectData: {
        type: 'object',
        properties: {
          nombre: { type: 'string', example: 'Proyecto Gitano' },
          descripcion: { type: 'string', example: 'Simulador de vida gitana' },
          cliente: { type: 'string', example: '660f0dbbccba3b1b0c4d9d85' }
        },
        required: ['nombre', 'descripcion', 'cliente']
      },
      DeliveryNoteData: {
        type: 'object',
        properties: {
          numero: { type: 'string', example: 'ALB-2025-001' },
          fecha: { type: 'string', format: 'date', example: '2025-04-19' },
          cliente: { type: 'string', example: '662d876a289ab2a3d8ea0f01' },
          proyecto: { type: 'string', example: '662d876a289ab2a3d8ea0f02' },
          total: { type: 'number', example: 250 },
          horas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                descripcion: { type: 'string', example: 'Mano de obra' },
                cantidad: { type: 'number', example: 5 },
                precio: { type: 'number', example: 20 }
              }
            }
          },
          materiales: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                descripcion: { type: 'string', example: 'Tubos PVC' },
                cantidad: { type: 'number', example: 10 },
                precio: { type: 'number', example: 2.5 }
              }
            }
          }
        },
        required: ['numero', 'fecha', 'cliente', 'proyecto', 'total']
      },
      UserData: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65e9a8e49cfcfe2b3a3c8f1a' },
          email: { type: 'string', example: 'juan@flama.com' },
          role: { type: 'string', example: 'admin' },
          status: { type: 'string', example: 'validated' },
          name: { type: 'string', example: 'Juan' },
          surname: { type: 'string', example: 'El Flama' },
          nif: { type: 'string', example: '12345678Z' },
          phone: { type: 'string', example: '+34600111222' },
          address: { $ref: '#/components/schemas/Address' },
          company: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Gitano S.L.' },
              cif: { type: 'string', example: 'B12345678' },
              address: { $ref: '#/components/schemas/Address' }
            }
          },
          logoUrl: { type: 'string', example: 'http://localhost:3000/uploads/logo.png' },
          createdAt: { type: 'string', format: 'date-time', example: '2024-03-15T12:34:56.789Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2024-04-10T14:12:34.123Z' }
        }
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
  apis: ['./routes/userRoutes.js', './routes/onboardingRoutes.js', './routes/clientRoutes.js', './routes/projectRoutes.js', './routes/deliveryNoteRoutes.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;