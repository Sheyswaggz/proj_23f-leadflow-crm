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
let testLead1Id: string;

beforeAll(async () => {
  await prisma.$connect();

  const user1Email = `updatetest1${Date.now()}@example.com`;
  const user1Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user1Email,
      password: 'password123',
      name: 'Update Test User 1',
    });

  testUser1Token = user1Response.body.data.token;
  testUser1Id = user1Response.body.data.user.id;

  const user2Email = `updatetest2${Date.now()}@example.com`;
  const user2Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user2Email,
      password: 'password123',
      name: 'Update Test User 2',
    });

  testUser2Token = user2Response.body.data.token;
  testUser2Id = user2Response.body.data.user.id;

  const leadResponse = await request(app)
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${testUser1Token}`)
    .send({
      name: 'Test Lead for Update',
      email: 'testlead@example.com',
      phone: '555-0000',
      company: 'Test Company',
      jobTitle: 'Manager',
      stage: LeadStage.NEW,
      notes: 'Original notes',
      dealValue: 5000,
    });

  testLead1Id = leadResponse.body.data.id;
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

describe('PATCH /api/v1/leads/:id', () => {
  it('updates lead name only', async () => {
    const response = await request(app)
      .patch(`/api/v1/leads/${testLead1Id}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Updated Lead Name',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Lead Name');
    expect(response.body.data.email).toBe('testlead@example.com');
    expect(response.body.data.phone).toBe('555-0000');
    expect(response.body.data.company).toBe('Test Company');
    expect(response.body.data.jobTitle).toBe('Manager');
    expect(response.body.data.stage).toBe(LeadStage.NEW);
    expect(response.body.data.notes).toBe('Original notes');
    expect(response.body.data.dealValue).toBe(5000);
  });

  it('updates stage to CONTACTED', async () => {
    const response = await request(app)
      .patch(`/api/v1/leads/${testLead1Id}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        stage: LeadStage.CONTACTED,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.stage).toBe(LeadStage.CONTACTED);
    expect(response.body.data.name).toBe('Updated Lead Name');
  });

  it('updates multiple fields at once', async () => {
    const response = await request(app)
      .patch(`/api/v1/leads/${testLead1Id}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Multi-field Updated Lead',
        email: 'newemail@example.com',
        stage: LeadStage.QUALIFIED,
        dealValue: 15000,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Multi-field Updated Lead');
    expect(response.body.data.email).toBe('newemail@example.com');
    expect(response.body.data.stage).toBe(LeadStage.QUALIFIED);
    expect(response.body.data.dealValue).toBe(15000);
    expect(response.body.data.phone).toBe('555-0000');
  });

  it('returns 404 for non-existent lead', async () => {
    await request(app)
      .patch('/api/v1/leads/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Should Fail',
      })
      .expect(404);
  });

  it('returns 404 for another users lead', async () => {
    const user2LeadResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser2Token}`)
      .send({
        name: 'User 2 Lead',
        stage: LeadStage.NEW,
      });

    const user2LeadId = user2LeadResponse.body.data.id;

    await request(app)
      .patch(`/api/v1/leads/${user2LeadId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Trying to update other user lead',
      })
      .expect(404);
  });

  it('returns 401 without token', async () => {
    await request(app)
      .patch(`/api/v1/leads/${testLead1Id}`)
      .send({
        name: 'Should Fail',
      })
      .expect(401);
  });

  it('returns 400 for invalid stage value', async () => {
    await request(app)
      .patch(`/api/v1/leads/${testLead1Id}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        stage: 'INVALID_STAGE',
      })
      .expect(400);
  });

  it('updates updatedAt timestamp', async () => {
    const beforeUpdate = await request(app)
      .get(`/api/v1/leads/${testLead1Id}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    const originalUpdatedAt = new Date(beforeUpdate.body.data.updatedAt);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await request(app)
      .patch(`/api/v1/leads/${testLead1Id}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Timestamp Test',
      })
      .expect(200);

    const newUpdatedAt = new Date(response.body.data.updatedAt);
    expect(newUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
