import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import prisma from '../../../lib/prisma.js';
import { LeadStage } from '../lead.schemas.js';

const app = createApp();

let testUser1Token: string;
let testUser1Id: string;
let testUser2Token: string;
let testUser2Id: string;

beforeAll(async () => {
  await prisma.$connect();

  const user1Email = `leadtest1${Date.now()}@example.com`;
  const user1Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user1Email,
      password: 'password123',
      name: 'Test User 1',
    });

  testUser1Token = user1Response.body.data.token;
  testUser1Id = user1Response.body.data.user.id;

  const user2Email = `leadtest2${Date.now()}@example.com`;
  const user2Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user2Email,
      password: 'password123',
      name: 'Test User 2',
    });

  testUser2Token = user2Response.body.data.token;
  testUser2Id = user2Response.body.data.user.id;
});

afterAll(async () => {
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

describe('POST /api/v1/leads', () => {
  it('creates lead with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        company: 'Acme Corp',
        jobTitle: 'CEO',
        stage: LeadStage.NEW,
        notes: 'Interested in our product',
        dealValue: 10000,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('John Doe');
    expect(response.body.data.email).toBe('john@example.com');
    expect(response.body.data.userId).toBe(testUser1Id);
    expect(response.body.data.stage).toBe(LeadStage.NEW);
    expect(response.body.data.id).toBeDefined();
  });

  it('rejects missing name', async () => {
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        email: 'invalid@example.com',
      })
      .expect(400);
  });

  it('returns 401 without token', async () => {
    await request(app)
      .post('/api/v1/leads')
      .send({
        name: 'John Doe',
      })
      .expect(401);
  });
});

describe('GET /api/v1/leads', () => {
  it('returns paginated leads for user', async () => {
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Lead 1',
      });

    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Lead 2',
      });

    const response = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.leads)).toBe(true);
    expect(response.body.data.leads.length).toBeGreaterThanOrEqual(2);
    expect(response.body.data.pagination).toBeDefined();
    expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(2);
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.limit).toBe(20);
  });

  it('does not return other users leads', async () => {
    const leadResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser2Token}`)
      .send({
        name: 'User 2 Lead',
      });

    const user2LeadId = leadResponse.body.data.id;

    const response = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    const leadIds = response.body.data.leads.map((lead: any) => lead.id);
    expect(leadIds).not.toContain(user2LeadId);
  });

  it('filters by stage query param', async () => {
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Contacted Lead',
        stage: LeadStage.CONTACTED,
      });

    const response = await request(app)
      .get('/api/v1/leads')
      .query({ stage: LeadStage.CONTACTED })
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    response.body.data.leads.forEach((lead: any) => {
      expect(lead.stage).toBe(LeadStage.CONTACTED);
    });
  });

  it('searches by name', async () => {
    const uniqueName = `SearchTest${Date.now()}`;
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: uniqueName,
      });

    const response = await request(app)
      .get('/api/v1/leads')
      .query({ search: uniqueName })
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.leads.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.leads.some((lead: any) => lead.name === uniqueName)).toBe(true);
  });
});

describe('GET /api/v1/leads/:id', () => {
  it('returns lead for owner', async () => {
    const createResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Get Test Lead',
      });

    const leadId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(leadId);
    expect(response.body.data.name).toBe('Get Test Lead');
  });

  it('returns 404 for non-existent id', async () => {
    await request(app)
      .get('/api/v1/leads/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(404);
  });

  it('returns 404 for another users lead', async () => {
    const createResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser2Token}`)
      .send({
        name: 'User 2 Private Lead',
      });

    const leadId = createResponse.body.data.id;

    await request(app)
      .get(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(404);
  });
});

describe('DELETE /api/v1/leads/:id', () => {
  it('deletes lead', async () => {
    const createResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Delete Test Lead',
      });

    const leadId = createResponse.body.data.id;

    const deleteResponse = await request(app)
      .delete(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe('Lead deleted successfully');

    await request(app)
      .get(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(404);
  });

  it('returns 404 for another users lead', async () => {
    const createResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser2Token}`)
      .send({
        name: 'User 2 Protected Lead',
      });

    const leadId = createResponse.body.data.id;

    await request(app)
      .delete(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(404);
  });
});
