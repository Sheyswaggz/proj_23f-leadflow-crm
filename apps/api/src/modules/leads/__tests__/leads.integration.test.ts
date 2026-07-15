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

  it('create lead with all optional fields', async () => {
    const response = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-9999',
        company: 'Tech Corp',
        jobTitle: 'CTO',
        stage: LeadStage.QUALIFIED,
        notes: 'Very interested in enterprise plan',
        dealValue: 50000,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Jane Smith');
    expect(response.body.data.email).toBe('jane@example.com');
    expect(response.body.data.phone).toBe('555-9999');
    expect(response.body.data.company).toBe('Tech Corp');
    expect(response.body.data.jobTitle).toBe('CTO');
    expect(response.body.data.stage).toBe(LeadStage.QUALIFIED);
    expect(response.body.data.notes).toBe('Very interested in enterprise plan');
    expect(response.body.data.dealValue).toBe(50000);
  });

  it('create lead with only required name field', async () => {
    const response = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Minimal Lead',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Minimal Lead');
    expect(response.body.data.stage).toBe(LeadStage.NEW);
    expect(response.body.data.id).toBeDefined();
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

  it('list returns empty array when no leads exist', async () => {
    const uniqueUserEmail = `emptytest${Date.now()}@example.com`;
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueUserEmail,
        password: 'password123',
        name: 'Empty Test User',
      });

    const emptyToken = userResponse.body.data.token;

    const response = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${emptyToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.leads)).toBe(true);
    expect(response.body.data.leads.length).toBe(0);
    expect(response.body.data.pagination.total).toBe(0);
  });

  it('search with special characters does not error', async () => {
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'O\'Brien & Co',
        company: 'O\'Brien & Co',
      });

    const response = await request(app)
      .get('/api/v1/leads')
      .query({ search: 'O\'Brien & Co' })
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('pagination returns correct page 2 results', async () => {
    for (let i = 1; i <= 25; i++) {
      await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({
          name: `Pagination Test Lead ${i}`,
        });
    }

    const page2Response = await request(app)
      .get('/api/v1/leads')
      .query({ page: 2, limit: 20 })
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(page2Response.body.success).toBe(true);
    expect(page2Response.body.data.pagination.page).toBe(2);
    expect(page2Response.body.data.pagination.limit).toBe(20);
    expect(page2Response.body.data.leads.length).toBeGreaterThan(0);
  });

  it('filter by CLOSED_WON stage', async () => {
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Won Lead',
        stage: LeadStage.CLOSED_WON,
      });

    const response = await request(app)
      .get('/api/v1/leads')
      .query({ stage: LeadStage.CLOSED_WON })
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.leads.length).toBeGreaterThan(0);
    response.body.data.leads.forEach((lead: any) => {
      expect(lead.stage).toBe(LeadStage.CLOSED_WON);
    });
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
