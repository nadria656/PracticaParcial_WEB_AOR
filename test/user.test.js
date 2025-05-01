const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/user');

let token = '';
let code = '';
let testEmail = `test${Date.now()}@example.com`;
let testPassword = 'TestPass123';

describe('User Controller', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('debería registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('no debería permitir registrar el mismo email validado', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: testEmail, password: testPassword });

    expect([409, 400]).toContain(res.status);
  });

  it('no debería validar email con código incorrecto', async () => {
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/incorrecto/i);
  });

  it('debería validar el email con el código correcto', async () => {
    const user = await User.findOne({ email: testEmail });
    code = user.code;

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Email validado correctamente/i);
  });

  it('debería iniciar sesión con el email validado', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('debería obtener el perfil del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  it('debería solicitar un código de recuperación de contraseña', async () => {
    const res = await request(app)
      .post('/api/user/forgot-password')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code');
    code = res.body.code;
  });

  it('debería resetear la contraseña con código válido', async () => {
    const res = await request(app)
      .post('/api/user/reset-password')
      .send({
        email: testEmail,
        code,
        newPassword: 'NewPass123'
      });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Contraseña actualizada correctamente/i);
  });

  it('debería iniciar sesión con la nueva contraseña', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: testEmail, password: 'NewPass123' });

    expect(res.status).toBe(200);
    token = res.body.token;
  });

  it('debería subir un logo correctamente', async () => {
    const res = await request(app)
      .patch('/api/user/logo')
      .set('Authorization', `Bearer ${token}`)
      .attach('logo', path.resolve(__dirname, '../jordi.jpg'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('logoUrl');
  });

  it('debería eliminar el usuario (soft delete)', async () => {
    const res = await request(app)
      .delete('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/marcado como eliminado/i);
  });

  it('debería eliminar permanentemente un usuario (hard delete)', async () => {
    const email = `delete${Date.now()}@test.com`;

    const resRegister = await request(app)
      .post('/api/user/register')
      .send({ email, password: '12345678' });

    const tempToken = resRegister.body.token;

    await User.updateOne({ email }, { status: 'validated' });

    const resDelete = await request(app)
      .delete('/api/user?soft=false')
      .set('Authorization', `Bearer ${tempToken}`);

    expect(resDelete.status).toBe(200);
    expect(resDelete.body.msg).toMatch(/eliminado permanentemente/i);
  });

  it('debería invitar a un usuario si el usuario tiene compañía', async () => {
    // Asegurar que el usuario tiene compañía
    const admin = await User.findOne({ email: testEmail });
    admin.company = { name: 'Compañía Test' };
    await admin.save();

    const res = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: `invitado${Date.now()}@example.com` });

    expect(res.status).toBe(201);
    expect(res.body.msg).toMatch(/Usuario invitado correctamente/);
  });
});
