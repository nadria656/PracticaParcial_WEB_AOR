const request = require('supertest');
const app = require('../app');
const Cliente = require('../models/Cliente');  // Asegúrate de que tienes el modelo Cliente
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

describe('Clientes', () => {
  let token = "";  // Variable para guardar el token
  let clienteId = "";  // Variable para guardar el ID del cliente creado

  // Limpiamos la base de datos antes de las pruebas
  beforeAll(async () => {
    await Cliente.deleteMany({});  // Elimina todos los clientes antes de los tests

    // Realizamos el login para obtener el token
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({
        email: 'admin8@example.com',  // Cambia esto por un email válido
        password: '12345678'         // Cambia esto por una contraseña válida
      });
    token = loginRes.body.token;  // Guarda el token que devuelve el login
  });

  // Test para crear un cliente
  it('should create a client', async () => {
    const userId = new ObjectId();  // Creamos un ID válido de MongoDB
    const companiaId = new ObjectId();  // Creamos un ID válido de MongoDB

    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)  // Usamos el token recibido en el login
      .send({
        nombre: 'Ferretería El Gitano',
        cif: 'B12345678',
        direccion: {
          calle: 'Calle del Flamenco 7',
          ciudad: 'Triana',
          codigoPostal: '41010',
          pais: 'España'
        },
        usuario: userId,
        compania: companiaId
      });

    expect(res.status).toBe(201);  // Verificamos que la respuesta sea 201 (Creado)
    expect(res.body).toHaveProperty('nombre', 'Ferretería El Gitano');
    expect(res.body).toHaveProperty('cif', 'B12345678');
    clienteId = res.body._id;  // Guardamos el ID del cliente para futuras pruebas
  });

  // Test para listar todos los clientes
  it('should list all clients', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);  // Usamos el token recibido

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);  
    expect(res.body[0]).toHaveProperty('nombre');
  });

  // Test para obtener un cliente por ID
  it('should get a client by ID', async () => {
    const res = await request(app)
      .get(`/api/client/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);  // Usamos el token recibido

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', clienteId.toString());
  });

  // Test para archivar un cliente (soft delete)
  it('should archive a client (soft delete)', async () => {
    const res = await request(app)
      .patch(`/api/client/archive/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);  // Usamos el token recibido

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Cliente archivado correctamente');
    expect(res.body.cliente.archivado).toBe(true);
  });

  // Test para recuperar un cliente archivado (soft delete)
  it('should recover an archived client (soft delete)', async () => {
    const res = await request(app)
      .patch(`/api/client/recover/${clienteId}`)
      .set('Authorization', `Bearer ${token}`);  // Usamos el token recibido

    expect(res.status).toBe(200);  // Verificamos que la respuesta sea 200 (OK)
    expect(res.body.mensaje).toBe('Cliente recuperado correctamente');
    expect(res.body.cliente.archivado).toBe(false);  // Verificamos que el cliente ahora está recuperado
  });

  // Test para eliminar un cliente (hard delete)
  it('should delete a client (hard delete)', async () => {
    const res = await request(app)
      .delete(`/api/client/${clienteId}?soft=false`)
      .set('Authorization', `Bearer ${token}`);  // Usamos el token recibido

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe('Cliente eliminado definitivamente (hard delete)');
  });

  // Test para crear un proyecto
    it('should create a project', async () => {
      const clienteId = new ObjectId();
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
  
    // Test para actualizar un proyecto
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
  
    // Test para listar todos los proyectos
    it('should list all projects', async () => {
      const res = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toHaveProperty('nombre');
    });
  
    // Test para obtener un proyecto por ID
    it('should get a project by ID', async () => {
      const res = await request(app)
        .get(`/api/project/${proyectoId}`)
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', proyectoId.toString());
    });
  
    // Test para eliminar un proyecto (soft delete)
    it('should archive a project (soft delete)', async () => {
      const res = await request(app)
        .delete(`/api/project/${proyectoId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(200);
      expect(res.body.mensaje).toBe('Proyecto archivado correctamente');
      expect(res.body.proyecto.archivado).toBe(true);
    });
  
    // Test para listar proyectos archivados
    it('should list all archived projects', async () => {
      const res = await request(app)
        .get('/api/project/archived')
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toHaveProperty('nombre');
    });
    
    // Test para recuperar un proyecto archivado
    it('should recover an archived project (soft delete)', async () => {
      // Primero, archivamos el proyecto
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
  
    
  
    // Test para eliminar un proyecto (hard delete)
    it('should delete a project (hard delete)', async () => {
      const res = await request(app)
        .delete(`/api/project/${proyectoId}?soft=false`)
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(200);
      expect(res.body.mensaje).toBe('Proyecto eliminado definitivamente (hard delete)');
    });
});
