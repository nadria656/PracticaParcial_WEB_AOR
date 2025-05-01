const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

describe('Proyectos', () => {
  let token = "";
  let proyectoId = "";
  let clienteId = "";

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'admin9@example.com', password: '12345678' });
    token = loginRes.body.token;

    const clienteRes = await request(app)
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

    clienteId = clienteRes.body._id;
  });

  it('debería crear un proyecto', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Proyecto Gitano',
        descripcion: 'Proyecto para crear un simulador de gitano',
        cliente: clienteId
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('nombre', 'Proyecto Gitano');
    expect(res.body).toHaveProperty('descripcion', 'Proyecto para crear un simulador de gitano');
    proyectoId = res.body._id;
  });

  it('debería actualizar un proyecto', async () => {
    const res = await request(app)
      .put(`/api/project/${proyectoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'Proyecto actualizado para crear un simulador mejorado'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('descripcion', 'Proyecto actualizado para crear un simulador mejorado');
  });

  it('debería listar todos los proyectos no eliminados', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  it('debería obtener un proyecto por ID', async () => {
    const res = await request(app)
      .get(`/api/project/${proyectoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', proyectoId.toString());
  });

  it('debería archivar un proyecto (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/project/${proyectoId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Proyecto archivado correctamente.');
    expect(res.body.proyecto).toHaveProperty('archivado', true);
  });

  it('debería listar proyectos archivados', async () => {
    const res = await request(app)
      .get('/api/project/archived')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('archivado', true);
  });

  it('debería recuperar un proyecto archivado', async () => {
    // Primero aseguramos que esté archivado
    await request(app)
      .delete(`/api/project/${proyectoId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/project/recover/${proyectoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Proyecto recuperado correctamente.');
    expect(res.body.proyecto).toHaveProperty('archivado', false);
  });

  it('debería eliminar un proyecto definitivamente (hard delete)', async () => {
    const res = await request(app)
      .delete(`/api/project/${proyectoId}?soft=false`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Proyecto eliminado definitivamente (hard delete).');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
