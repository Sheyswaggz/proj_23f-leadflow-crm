import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import prisma from '../../../lib/prisma.js';

const app = createApp();
const testEmail = 'test@example.com';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test',
      },
    },
  });
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/register', () => {
  it('creates user and returns token', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(uniqueEmail);
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    const uniqueEmail = `duplicate${Date.now()}@example.com`;

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password456',
        name: 'Another User',
      })
      .expect(409);
  });

  it('rejects invalid email', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        name: 'Test User',
      })
      .expect(400);
  });

  it('rejects short password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      })
      .expect(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const uniqueEmail = `login${Date.now()}@example.com`;
    const password = 'password123';

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password,
        name: 'Test User',
      })
      .expect(201);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(uniqueEmail);
  });

  it('rejects wrong password', async () => {
    const uniqueEmail = `wrongpass${Date.now()}@example.com`;

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'correctpassword',
        name: 'Test User',
      })
      .expect(201);

    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('rejects non-existent email', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
      .expect(401);
  });

  it('never exposes passwordHash', async () => {
    const uniqueEmail = `nohash${Date.now()}@example.com`;
    const password = 'password123';

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password,
        name: 'Test User',
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password,
      })
      .expect(200);

    const checkForPasswordHash = (obj: any): boolean => {
      if (obj === null || obj === undefined) {
        return false;
      }

      if (typeof obj !== 'object') {
        return false;
      }

      if ('passwordHash' in obj) {
        return true;
      }

      for (const key in obj) {
        if (checkForPasswordHash(obj[key])) {
          return true;
        }
      }

      return false;
    };

    expect(checkForPasswordHash(registerResponse.body)).toBe(false);
    expect(checkForPasswordHash(loginResponse.body)).toBe(false);
  });
});
