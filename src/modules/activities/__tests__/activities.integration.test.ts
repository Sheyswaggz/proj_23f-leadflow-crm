import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import prisma from '../../../lib/prisma.js';

const app = createApp();

let testUser1Token: string;
let testUser1Id: string;
let testUser1LeadId: string;
let testUser2Token: string;
let testUser2Id: string;
let testUser2LeadId: string;

beforeAll(async () => {
  await prisma.$connect();

  const user1Email = `activitytest1${Date.now()}@example.com`;
  const user1Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user1Email,
      password: 'password123',
      name: 'Test User 1',
    });

  testUser1Token = user1Response.body.data.token;
  testUser1Id = user1Response.body.data.user.id;

  const lead1Response = await request(app)
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${testUser1Token}`)
    .send({
      name: 'Test Lead 1',
      email: 'lead1@example.com',
    });

  testUser1LeadId = lead1Response.body.data.id;

  const user2Email = `activitytest2${Date.now()}@example.com`;
  const user2Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user2Email,
      password: 'password123',
      name: 'Test User 2',
    });

  testUser2Token = user2Response.body.data.token;
  testUser2Id = user2Response.body.data.user.id;

  const lead2Response = await request(app)
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${testUser2Token}`)
    .send({
      name: 'Test Lead 2',
      email: 'lead2@example.com',
    });

  testUser2LeadId = lead2Response.body.data.id;
});

afterAll(async () => {
  await prisma.activityLog.deleteMany({
    where: {
      userId: {
        in: [testUser1Id, testUser2Id],
      },
    },
  });

  await prisma.lead.deleteMany({
    where: {
      userId: {
        in: [testUser1Id, testUser2Id],
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: [testUser1Id, testUser2Id],
      },
    },
  });

  await prisma.$disconnect();
});

describe('POST /api/v1/leads/:leadId/activities', () => {
  it('creates CALL activity', async () => {
    const response = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'CALL',
        content: 'Called the lead to discuss requirements',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('CALL');
    expect(response.body.data.content).toBe('Called the lead to discuss requirements');
    expect(response.body.data.leadId).toBe(testUser1LeadId);
    expect(response.body.data.userId).toBe(testUser1Id);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.createdAt).toBeDefined();
  });

  it('creates NOTE activity', async () => {
    const response = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'NOTE',
        content: 'Lead is interested in premium package',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('NOTE');
    expect(response.body.data.content).toBe('Lead is interested in premium package');
  });

  it('returns 400 for missing content', async () => {
    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'CALL',
      })
      .expect(400);
  });

  it('returns 400 for invalid type', async () => {
    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'INVALID_TYPE',
        content: 'Some content',
      })
      .expect(400);
  });

  it('returns 404 for non-existent lead', async () => {
    await request(app)
      .post('/api/v1/leads/00000000-0000-0000-0000-000000000000/activities')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'CALL',
        content: 'Some content',
      })
      .expect(404);
  });

  it('returns 404 for another users lead', async () => {
    await request(app)
      .post(`/api/v1/leads/${testUser2LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'CALL',
        content: 'Trying to access another users lead',
      })
      .expect(404);
  });

  it('returns 401 without token', async () => {
    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .send({
        type: 'CALL',
        content: 'Some content',
      })
      .expect(401);
  });
});

describe('GET /api/v1/leads/:leadId/activities', () => {
  it('returns activities in descending order', async () => {
    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'CALL',
        content: 'First activity',
      });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'EMAIL',
        content: 'Second activity',
      });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        type: 'MEETING',
        content: 'Third activity',
      });

    const response = await request(app)
      .get(`/api/v1/leads/${testUser1LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);

    const activities = response.body.data;
    expect(activities[0].content).toContain('Third activity');
    expect(activities[0].user).toBeDefined();
    expect(activities[0].user.id).toBe(testUser1Id);
    expect(activities[0].user.name).toBe('Test User 1');

    for (let i = 1; i < activities.length; i++) {
      const currentDate = new Date(activities[i - 1].createdAt);
      const previousDate = new Date(activities[i].createdAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(previousDate.getTime());
    }
  });

  it('returns empty array for lead with no activities', async () => {
    const newLeadResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Empty Lead',
        email: 'empty@example.com',
      });

    const newLeadId = newLeadResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/leads/${newLeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(0);
  });

  it('returns 404 for another users lead', async () => {
    await request(app)
      .get(`/api/v1/leads/${testUser2LeadId}/activities`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(404);
  });

  it('returns 401 without token', async () => {
    await request(app)
      .get(`/api/v1/leads/${testUser1LeadId}/activities`)
      .expect(401);
  });
});
