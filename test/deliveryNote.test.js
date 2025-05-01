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
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'admin9@example.com', password: '12345678' });

    token = loginRes.body.token;

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
        }
      });
    clienteId = clienteRes.body._id;

    const proyectoRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Proyecto Test Albarán',
        descripcion: 'Descripción test',
        cliente: clienteId
      });
    proyectoId = proyectoRes.body._id;
  });

  beforeEach(async () => {
    await DeliveryNote.deleteMany();
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
      deliveryNoteId = res.body._id;
    });
  });

  describe('Listar y Obtener', () => {
    beforeEach(async () => {
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

    it('debería listar todos los albaranes del usuario o compañía', async () => {
      const res = await request(app)
        .get('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('debería obtener un albarán por ID', async () => {
      const res = await request(app)
        .get(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', deliveryNoteId);
      expect(res.body).toHaveProperty('numero', 'TEST-ALB-002');
    });
  });

  describe('Eliminar', () => {
    beforeEach(async () => {
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

    it('debería eliminar un albarán no firmado', async () => {
      const res = await request(app)
        .delete(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('msg', 'Albarán eliminado correctamente.');
    });
  });

  describe('Generar PDF', () => {
    beforeEach(async () => {
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

    it('debería generar un PDF y devolver la URL', async () => {
      const res = await request(app)
        .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('msg', expect.stringContaining('PDF generado'));
      expect(res.body).toHaveProperty('pdfUrl');
      expect(res.body.pdfUrl).toMatch(/^http/);
    });
  });

  describe('Firmar albarán', () => {
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

    it('debería firmar el albarán, generar PDF y devolver URLs', async () => {
      const firmaPath = path.resolve(__dirname, '../__tests__/jordi.jpg');

      const res = await request(app)
        .patch(`/api/deliverynote/firmar/${signableNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('firma', firmaPath);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('msg', 'Albarán firmado correctamente.');
      expect(res.body).toHaveProperty('firmaUrl');
      expect(res.body).toHaveProperty('pdfUrl');
    });
  });

  describe('Descargar PDF desde IPFS', () => {
    beforeEach(async () => {
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

      const firmaPath = path.resolve(__dirname, '../__tests__/jordi.jpg');

      await request(app)
        .patch(`/api/deliverynote/firmar/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('firma', firmaPath);
    });

    it('debería redirigir al PDF si está en IPFS', async () => {
      const res = await request(app)
        .get(`/api/deliverynote/cloud/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect([302, 303]).toContain(res.status);
      expect(res.headers.location).toMatch(/^http/);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
