const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const DeliveryNote = require('../models/DeliveryNote'); 
const path = require('path');

let token = '';
let clienteId = '';
let proyectoId = '';
let deliveryNoteId = '';

describe('Albaranes', () => {
  beforeAll(async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'admin9@example.com', password: '12345678' });
    token = loginRes.body.token;

    // Crear cliente
    const clienteRes = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Cliente Test Albarán',
        cif: 'TESTCIF999',
        direccion: {
          calle: 'Calle Test',
          ciudad: 'Testópolis',
          codigoPostal: '12345',
          pais: 'España'
        },
        usuario: new ObjectId(),
        compania: new ObjectId()
      });
    clienteId = clienteRes.body._id;

    // Crear proyecto
    const proyectoRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Proyecto Test Albarán',
        descripcion: 'Descripción test',
        cliente: clienteId,
        compania: new ObjectId()
      });
    proyectoId = proyectoRes.body._id;
  });

  beforeEach(async () => {
    await DeliveryNote.deleteMany(); // 💥 Limpiar albaranes antes de cada test
  });

  describe('Crear', () => {
    it('debería crear un albarán correctamente', async () => {
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numero: 'TEST-ALB-001',
          fecha: new Date(),
          cliente: clienteId,
          proyecto: proyectoId,
          total: 100,
          horas: [],
          materiales: []
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('numero', 'TEST-ALB-001');
      expect(res.body).toHaveProperty('_id');

      // Guardamos el ID para el siguiente test
      deliveryNoteId = res.body._id;
    });
  });

  describe('Listar y Obtener', () => {
    beforeEach(async () => {
      // Crear un albarán para testear
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numero: 'TEST-ALB-002',
          fecha: new Date(),
          cliente: clienteId,
          proyecto: proyectoId,
          total: 200,
          horas: [],
          materiales: []
        });

      deliveryNoteId = res.body._id;
    });

    it('should list all delivery notes', async () => {
      const res = await request(app)
        .get('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get a delivery note by ID', async () => {
      const res = await request(app)
        .get(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', deliveryNoteId);
      expect(res.body.numero).toBe('TEST-ALB-002');
    });
  });

  describe('Eliminar', () => {
    beforeEach(async () => {
      // Crear un albarán específico para probar la eliminación
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numero: 'TEST-ALB-DELETE',
          fecha: new Date(),
          cliente: clienteId,
          proyecto: proyectoId,
          total: 300,
          horas: [],
          materiales: []
        });

      deliveryNoteId = res.body._id;
    });

    it('debería eliminar un albarán correctamente', async () => {
      const res = await request(app)
        .delete(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('mensaje', 'Albarán eliminado correctamente');
    });

  });

  describe('Generar PDF', () => {
    beforeEach(async () => {
      // Creamos un albarán nuevo
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numero: 'TEST-ALB-PDF',
          fecha: new Date(),
          cliente: clienteId,
          proyecto: proyectoId,
          total: 400,
          horas: [],
          materiales: []
        });

      deliveryNoteId = res.body._id;
    });

    it('debería generar un PDF correctamente', async () => {
      const res = await request(app)
        .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('mensaje', '✅ PDF generado correctamente');
      expect(res.body.pdfUrl).toMatch(/^http/);
    });
  });

  describe('Firmar Albarán', () => {
    let signableNoteId = '';
  
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numero: 'FIRMABLE-001',
          fecha: new Date(),
          cliente: clienteId,
          proyecto: proyectoId,
          total: 500,
          horas: [],
          materiales: []
        });
  
      signableNoteId = res.body._id;
    });
  
    it('debería firmar un albarán correctamente', async () => {
      const firmaPath = path.resolve(__dirname, '../__tests__/jordi.jpg');
  
      const res = await request(app)
        .patch(`/api/deliverynote/firmar/${signableNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('firma', firmaPath);
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('msg', '✅ Albarán firmado correctamente');
      expect(res.body).toHaveProperty('firmaUrl');
      expect(res.body).toHaveProperty('pdfUrl');
    });
  });
  
  describe('Descargar PDF desde la nube', () => {
    beforeEach(async () => {
      // Crear albarán
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numero: 'TEST-ALB-CLOUD',
          fecha: new Date(),
          cliente: clienteId,
          proyecto: proyectoId,
          total: 600,
          horas: [],
          materiales: []
        });
  
      deliveryNoteId = res.body._id;
  
      // Ruta a la firma real
      const firmaPath = path.resolve(__dirname, '../__tests__/jordi.jpg');
  
      // Firmar el albarán
      const firmaRes = await request(app)
        .patch(`/api/deliverynote/firmar/${deliveryNoteId}`) // 👈 Usa PATCH como en tus rutas
        .set('Authorization', `Bearer ${token}`)
        .attach('firma', firmaPath);
  
      // Confirmar que se ha guardado bien
      expect(firmaRes.status).toBe(200);
      expect(firmaRes.body).toHaveProperty('pdfUrl');
    });
  
    it('debería redirigir al PDF en la nube si está disponible', async () => {
      const res = await request(app)
        .get(`/api/deliverynote/cloud/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);
  
      console.log(' Redirección a:', res.headers.location);
  
      expect([302, 303]).toContain(res.status); // ✅ Redirección
      expect(res.headers.location).toMatch(/^http/); // ✅ URL válida
    });
  });
  
  


  afterAll(async () => {
    await mongoose.connection.close();
  });
});
