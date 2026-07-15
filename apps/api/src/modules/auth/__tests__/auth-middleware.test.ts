import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../../app.js';
import prisma from '../../../lib/prisma.js';
import redis from '../../../lib/redis.js';

const app = createApp();

let testToken: string;
let testUserId: string;

beforeAll(async () => {
  await prisma.$connect();
  await redis.connect();

  const uniqueEmail = `middleware-test-${Date.now()}@example.com`;
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: uniqueEmail,
      password: 'password123',
      name: 'Middleware Test User',
    });

  testToken = response.body.data.token;
  testUserId = response.body.data.user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'middleware-test',
      },
    },
  });
  await redis.disconnect();
  await prisma.$disconnect();
});

describe('GET /api/v1/auth/me', () => {
  it('returns user for valid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testUserId);
    expect(response.body.data.email).toBeDefined();
    expect(response.body.data.name).toBeDefined();
  });

  it('returns 401 without token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('returns 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('returns 401 with expired token', async () => {
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const expiredToken = jwt.sign(
      { userId: testUserId, email: 'test@example.com' },
      jwtSecret,
      { expiresIn: '0s' }
    );

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('returns 200 and invalidates token', async () => {
    const uniqueEmail = `logout-test-${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Logout Test User',
      });

    const token = registerResponse.body.data.token;

    const logoutResponse = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(logoutResponse.body.success).toBe(true);
    expect(logoutResponse.body.message).toBe('Logged out successfully');

    const meResponse = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(meResponse.body.success).toBe(false);
  });

  it('requires authentication', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});
