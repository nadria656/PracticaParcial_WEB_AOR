const request = require('supertest');
const app = require('../app');
const Cliente = require('../models/Cliente');
const mongoose = require('mongoose');

describe('Clientes', () => {
  let token = '';
  let clienteId = '';

  beforeAll(async () => {
    await Cliente.deleteMany({});

    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'admin9@example.com', password: '12345678' });

    token = loginRes.body.token;
  });

  it('debería crear un cliente nuevo o detectar duplicado', async () => {
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
        }
      });

    expect([201, 409]).toContain(res.status);

    if (res.status === 201) {
      expect(res.body).toHaveProperty('nombre', 'Ferretería El Gitano');
      clienteId = res.body._id;
    } else {
      // Si ya existe, buscarlo para continuar el resto de tests
      const lista = await request(app)
        .get('/api/client')
        .set('Authorization', `Bearer ${token}`);
      const encontrado = lista.body.find(c => c.cif === 'B12345678');
      expect(encontrado).toBeDefined();
      clienteId = encontrado._id;
    }
  });

  it('debería listar todos los clientes del usuario o compañía', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  it('debería obtener un cliente por ID', async () => {
    const res = await request(app)
      .get(`/api/client/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', clienteId.toString());
    expect(res.body).toHaveProperty('nombre');
  });

  it('debería actualizar los datos del cliente', async () => {
    const res = await request(app)
      .put(`/api/client/${clienteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Ferretería El Gitano Actualizada',
        cif: 'B99999999',
        direccion: {
          calle: 'Calle Nueva 123',
          ciudad: 'Sevilla',
          codigoPostal: '41001',
          pais: 'España'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Cliente actualizado correctamente.');
    expect(res.body.cliente).toHaveProperty('nombre', 'Ferretería El Gitano Actualizada');
    expect(res.body.cliente.direccion).toHaveProperty('ciudad', 'Sevilla');
  });


  it('debería archivar (soft delete) un cliente', async () => {
    const res = await request(app)
      .delete(`/api/client/${clienteId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Cliente archivado correctamente (soft delete).');
  });
  

  it('debería listar clientes archivados', async () => {
    // Primero archivamos
    await request(app)
      .patch(`/api/client/archive/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/client/archived')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(c => c._id === clienteId)).toBe(true);
  });

  it('debería recuperar un cliente archivado', async () => {
    const res = await request(app)
      .patch(`/api/client/recover/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Cliente recuperado correctamente.');
    expect(res.body.cliente).toHaveProperty('archivado', false);
  });

  it('debería eliminar un cliente definitivamente (hard delete)', async () => {
    const res = await request(app)
      .delete(`/api/client/${clienteId}?soft=false`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Cliente eliminado definitivamente (hard delete).');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
