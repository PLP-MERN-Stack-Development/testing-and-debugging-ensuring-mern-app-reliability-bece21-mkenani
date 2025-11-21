// server/tests/integration/auth.test.js - Integration tests for auth API endpoints

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const newUser = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    const user = await User.findOne({ email: 'new@example.com' });
    expect(user).not.toBeNull();
  });

  it('returns 400 for invalid registration', async () => {
    const invalidUser = {
      username: 'newuser',
      email: 'invalid',
      password: 'short',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(invalidUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for duplicate email', async () => {
    await User.create({
      username: 'existing',
      email: 'dup@example.com',
      password: 'password123',
    });

    const dupUser = {
      username: 'dupuser',
      email: 'dup@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(dupUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('duplicate');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create({
      username: 'loginuser',
      email: 'login@example.com',
      password: '$2b$10$hash', // Assume hashed, but for test, mock comparison
    });
  });

  it('logs in with valid credentials', async () => {
    const credentials = {
      email: 'login@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('returns 400 for invalid credentials', async () => {
    const invalidCreds = {
      email: 'login@example.com',
      password: 'wrongpass',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(invalidCreds);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for non-existent user', async () => {
    const nonExist = {
      email: 'noexist@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(nonExist);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});