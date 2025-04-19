const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const path = require('path');

let token = '';
let code = '';
let testEmail = `test${Date.now()}@example.com`;
let testPassword = 'TestPass123';

describe('User Controller', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should fail to register the same user again (email already registered)', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
  });

  it('should fail to validate email with wrong code', async () => {
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });

    expect(res.status).toBe(400);
  });

  it('should get the correct code from DB and validate', async () => {
    const user = await mongoose.model('User').findOne({ email: testEmail });
    code = user.code;

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Email validado correctamente/);
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get the user profile', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  it('should request password reset', async () => {
    const res = await request(app)
      .post('/api/user/forgot-password')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code');
    code = res.body.code;
  });

  it('should reset the password with correct code', async () => {
    const res = await request(app)
      .post('/api/user/reset-password')
      .send({ email: testEmail, code, newPassword: 'NewPass123' });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Contraseña actualizada correctamente/);
  });

  it('should login with new password', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: testEmail, password: 'NewPass123' });

    expect(res.status).toBe(200);
    token = res.body.token;
  });

  it('should upload a logo', async () => {
    const res = await request(app)
      .patch('/api/user/logo')
      .set('Authorization', `Bearer ${token}`)
      .attach('logo', path.resolve(__dirname, '../jordi.jpg'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('logoUrl');
  });

  it('should soft delete the user', async () => {
    const res = await request(app)
      .delete('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Usuario marcado como eliminado/);
  });

  it('should hard delete the user', async () => {
    // Crear nuevo usuario
    const resRegister = await request(app)
      .post('/api/user/register')
      .send({ email: `delete${Date.now()}@test.com`, password: '12345678' });
  
    const tempToken = resRegister.body.token;
  
    // Validar email para poder borrarlo
    const user = await mongoose.model('User').findOne({ email: resRegister.body.email });
    await mongoose.model('User').updateOne({ _id: user._id }, { status: 'validated' });
  
    const resDelete = await request(app)
      .delete('/api/user?soft=false')
      .set('Authorization', `Bearer ${tempToken}`);
  
    expect(resDelete.status).toBe(200);
    expect(resDelete.body.msg).toMatch(/eliminado permanentemente/i);
  });
  
  it('should invite a guest user (if user has a company)', async () => {
    const admin = await mongoose.model('User').findOne({ email: testEmail });
    admin.company = { name: 'Compañía Test' }; // o el modelo que uses
    await admin.save();
  
    const res = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: `invitado${Date.now()}@example.com` });
  
    expect(res.status).toBe(201);
    expect(res.body.msg).toMatch(/Usuario invitado correctamente/);
  });
  
});
