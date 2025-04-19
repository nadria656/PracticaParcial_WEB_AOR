
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
        },
        usuario: new ObjectId(),
        compania: new ObjectId()
      });

    clienteId = clienteRes.body._id;
  });

  it('should create a project', async () => {
    const companiaId = new ObjectId();

    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Proyecto Gitano',
        descripcion: 'Proyecto para crear un simulador de gitano',
        cliente: clienteId,
        compania: companiaId
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('nombre', 'Proyecto Gitano');
    expect(res.body).toHaveProperty('descripcion', 'Proyecto para crear un simulador de gitano');
    proyectoId = res.body._id;
  });

  it('should update a project', async () => {
    const res = await request(app)
      .put(`/api/project/${proyectoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'Proyecto actualizado para crear un simulador mejorado'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('descripcion', 'Proyecto actualizado para crear un simulador mejorado');
  });

  it('should list all projects', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  it('should get a project by ID', async () => {
    const res = await request(app)
      .get(`/api/project/${proyectoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', proyectoId.toString());
  });

  it('should archive a project (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/project/${proyectoId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Proyecto archivado correctamente');
    expect(res.body.proyecto.archivado).toBe(true);
  });

  it('should list all archived projects', async () => {
    const res = await request(app)
      .get('/api/project/archived')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  it('should recover an archived project (soft delete)', async () => {
    await request(app)
      .delete(`/api/project/${proyectoId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/project/recover/${proyectoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Proyecto recuperado correctamente');
    expect(res.body.proyecto.archivado).toBe(false);
  });

  it('should delete a project (hard delete)', async () => {
    const res = await request(app)
      .delete(`/api/project/${proyectoId}?soft=false`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Proyecto eliminado definitivamente (hard delete)');
  });
});
