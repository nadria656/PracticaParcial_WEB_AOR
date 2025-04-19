// test/onboarding.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

let token = '';
let testEmail = `onboard${Date.now()}@example.com`;
let testPassword = 'TestPass123';

describe('Onboarding Controller', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user for onboarding', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    token = res.body.token;
  });

  it('should validate email for onboarding user', async () => {
    const user = await mongoose.model('User').findOne({ email: testEmail });

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: user.code });

    expect(res.status).toBe(200);
  });

  it('should update personal data', async () => {
    const res = await request(app)
      .put('/api/onboarding/personal')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Antonio',
        surname: 'Camarón',
        nif: '12345678Z'
      });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Datos personales actualizados/);
    expect(res.body.user).toHaveProperty('name', 'Antonio');
  });

  it('should update company data as freelance', async () => {
    const res = await request(app)
      .patch('/api/onboarding/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        isFreelance: true
      });

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Datos de la compañía actualizados/);
    expect(res.body.company).toHaveProperty('cif', '12345678Z');
  });

  it('should update company data with full info', async () => {
    const res = await request(app)
      .patch('/api/onboarding/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        isFreelance: false,
        name: 'GitanoCorp',
        cif: 'G12345678',
        address: 'Calle del Compás 33'
      });

    expect(res.status).toBe(200);
    expect(res.body.company).toHaveProperty('name', 'GitanoCorp');
  });
});
