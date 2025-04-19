
const request = require('supertest');
const app = require('../app');
const Cliente = require('../models/Cliente');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

describe('Clientes', () => {
  let token = "";
  let clienteId = "";

  beforeAll(async () => {
    await Cliente.deleteMany({});

    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'admin9@example.com', password: '12345678' });
    token = loginRes.body.token;
  });

  it('should create a client', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Ferretería El Gitano',
        cif: 'B12345678',
        direccion: {
          calle: 'Calle del Flamenco 7',
          ciudad: 'Triana',
          codigoPostal: '41010',
          pais: 'España'
        },
        usuario: new ObjectId(),
        compania: new ObjectId()
      });
  
    console.log('Crear cliente →', res.status, res.body);
  
    expect([201, 409]).toContain(res.status);
  
    if (res.status === 201) {
      expect(res.body).toHaveProperty('nombre', 'Ferretería El Gitano');
      clienteId = res.body._id;
    } else {
      // Si es 409, buscamos el ID del cliente existente para continuar los tests
      const listado = await request(app)
        .get('/api/client')
        .set('Authorization', `Bearer ${token}`);
      clienteId = listado.body.find(c => c.cif === 'B12345678')._id;
    }
  });

  it('should list all clients', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  it('should get a client by ID', async () => {
    const res = await request(app)
      .get(`/api/client/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', clienteId.toString());
  });

  it('should archive a client (soft delete)', async () => {
    const res = await request(app)
      .patch(`/api/client/archive/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Cliente archivado correctamente');
    expect(res.body.cliente.archivado).toBe(true);
  });

  it('should recover an archived client (soft delete)', async () => {
    const res = await request(app)
      .patch(`/api/client/recover/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Cliente recuperado correctamente');
    expect(res.body.cliente.archivado).toBe(false);
  });

  it('should delete a client (hard delete)', async () => {
    const res = await request(app)
      .delete(`/api/client/${clienteId}?soft=false`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Cliente eliminado definitivamente (hard delete)');
  });
});
