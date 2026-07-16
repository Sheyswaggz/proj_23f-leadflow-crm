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

  const user1Email = `remindertest1${Date.now()}@example.com`;
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

  const user2Email = `remindertest2${Date.now()}@example.com`;
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
  await prisma.followUpReminder.deleteMany({
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

describe('POST /api/v1/leads/:leadId/reminders', () => {
  it('creates reminder with dueAt and note', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const response = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt,
        note: 'Follow up on proposal',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.dueAt).toBeDefined();
    expect(response.body.data.note).toBe('Follow up on proposal');
    expect(response.body.data.leadId).toBe(testUser1LeadId);
    expect(response.body.data.userId).toBe(testUser1Id);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.isCompleted).toBe(false);
  });

  it('creates reminder without note', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const response = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.dueAt).toBeDefined();
    expect(response.body.data.note).toBeNull();
  });

  it('returns 400 for invalid dueAt', async () => {
    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt: 'invalid-date',
        note: 'Some note',
      })
      .expect(400);
  });

  it('returns 404 for non-existent lead', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    await request(app)
      .post('/api/v1/leads/00000000-0000-0000-0000-000000000000/reminders')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt,
        note: 'Some note',
      })
      .expect(404);
  });
});

describe('GET /api/v1/leads/:leadId/reminders', () => {
  it('returns reminders for lead ordered by dueAt', async () => {
    const dueAt1 = new Date(Date.now() + 172800000).toISOString();
    const dueAt2 = new Date(Date.now() + 86400000).toISOString();
    const dueAt3 = new Date(Date.now() + 259200000).toISOString();

    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({ dueAt: dueAt1, note: 'Second reminder' });

    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({ dueAt: dueAt2, note: 'First reminder' });

    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({ dueAt: dueAt3, note: 'Third reminder' });

    const response = await request(app)
      .get(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);

    const reminders = response.body.data;
    for (let i = 1; i < reminders.length; i++) {
      const currentDate = new Date(reminders[i - 1].dueAt);
      const nextDate = new Date(reminders[i].dueAt);
      expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
    }
  });
});

describe('GET /api/v1/reminders', () => {
  it('returns all user reminders without filter', async () => {
    const response = await request(app)
      .get('/api/v1/reminders')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    const allReminders = response.body.data;
    allReminders.forEach((reminder: any) => {
      expect(reminder.userId).toBe(testUser1Id);
    });
  });

  it('returns only overdue reminders with ?status=overdue', async () => {
    const overdueDueAt = new Date(Date.now() - 86400000).toISOString();
    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt: overdueDueAt,
        note: 'Overdue reminder',
      });

    const response = await request(app)
      .get('/api/v1/reminders?status=overdue')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    const overdueReminders = response.body.data;
    overdueReminders.forEach((reminder: any) => {
      const dueDate = new Date(reminder.dueAt);
      expect(dueDate.getTime()).toBeLessThan(Date.now());
      expect(reminder.isCompleted).toBe(false);
    });
  });

  it('returns only upcoming with ?status=upcoming', async () => {
    const upcomingDueAt = new Date(Date.now() + 172800000).toISOString();
    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt: upcomingDueAt,
        note: 'Upcoming reminder',
      });

    const response = await request(app)
      .get('/api/v1/reminders?status=upcoming')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    const upcomingReminders = response.body.data;
    upcomingReminders.forEach((reminder: any) => {
      const dueDate = new Date(reminder.dueAt);
      expect(dueDate.getTime()).toBeGreaterThanOrEqual(Date.now() - 1000);
      expect(reminder.isCompleted).toBe(false);
    });
  });

  it('overdue boundary — reminder at exactly dueAt=now is overdue', async () => {
    const overdueDueAt = new Date(Date.now() - 1).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt: overdueDueAt,
        note: 'Just overdue reminder',
      });

    const reminderId = createResponse.body.data.id;

    const response = await request(app)
      .get('/api/v1/reminders?status=overdue')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    const overdueReminders = response.body.data;
    const foundReminder = overdueReminders.find((r: any) => r.id === reminderId);
    expect(foundReminder).toBeDefined();
  });

  it('upcoming boundary — reminder at dueAt=now+1ms is upcoming', async () => {
    const upcomingDueAt = new Date(Date.now() + 1).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt: upcomingDueAt,
        note: 'Just upcoming reminder',
      });

    const reminderId = createResponse.body.data.id;

    const response = await request(app)
      .get('/api/v1/reminders?status=upcoming')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    const upcomingReminders = response.body.data;
    const foundReminder = upcomingReminders.find((r: any) => r.id === reminderId);
    expect(foundReminder).toBeDefined();
  });

  it('list reminders with status=all returns both overdue and upcoming', async () => {
    const overdueDueAt = new Date(Date.now() - 86400000).toISOString();
    const upcomingDueAt = new Date(Date.now() + 86400000).toISOString();

    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt: overdueDueAt,
        note: 'Overdue for all test',
      });

    await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt: upcomingDueAt,
        note: 'Upcoming for all test',
      });

    const response = await request(app)
      .get('/api/v1/reminders?status=all')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThanOrEqual(2);

    const hasOverdue = response.body.data.some((r: any) => new Date(r.dueAt).getTime() < Date.now() && !r.isCompleted);
    const hasUpcoming = response.body.data.some((r: any) => new Date(r.dueAt).getTime() >= Date.now() && !r.isCompleted);
    expect(hasOverdue).toBe(true);
    expect(hasUpcoming).toBe(true);
  });
});

describe('PATCH /api/v1/reminders/:id', () => {
  it('updates note', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt,
        note: 'Original note',
      });

    const reminderId = createResponse.body.data.id;

    const response = await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        note: 'Updated note',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.note).toBe('Updated note');
  });

  it('marks as completed and sets completedAt', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt,
        note: 'To be completed',
      });

    const reminderId = createResponse.body.data.id;

    const response = await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        isCompleted: true,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.isCompleted).toBe(true);
    expect(response.body.data.completedAt).toBeDefined();
    expect(response.body.data.completedAt).not.toBeNull();
  });

  it('complete reminder sets completedAt to current time', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt,
        note: 'To be completed with timestamp check',
      });

    const reminderId = createResponse.body.data.id;
    const beforeComplete = Date.now();

    const response = await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        isCompleted: true,
      })
      .expect(200);

    const afterComplete = Date.now();

    expect(response.body.success).toBe(true);
    expect(response.body.data.isCompleted).toBe(true);
    expect(response.body.data.completedAt).toBeDefined();

    const completedAtTime = new Date(response.body.data.completedAt).getTime();
    expect(completedAtTime).toBeGreaterThanOrEqual(beforeComplete - 1000);
    expect(completedAtTime).toBeLessThanOrEqual(afterComplete + 1000);
  });

  it('returns 404 for another users reminder', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser2LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser2Token}`)
      .send({
        dueAt,
        note: 'User 2 reminder',
      });

    const reminderId = createResponse.body.data.id;

    await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        note: 'Trying to update another users reminder',
      })
      .expect(404);
  });

  it('cannot update reminder belonging to another user', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser2LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser2Token}`)
      .send({
        dueAt,
        note: 'User 2 private reminder',
      });

    const reminderId = createResponse.body.data.id;

    await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        isCompleted: true,
      })
      .expect(404);

    const verifyResponse = await request(app)
      .get('/api/v1/reminders')
      .set('Authorization', `Bearer ${testUser2Token}`)
      .expect(200);

    const reminder = verifyResponse.body.data.find((r: any) => r.id === reminderId);
    expect(reminder.isCompleted).toBe(false);
  });
});

describe('DELETE /api/v1/reminders/:id', () => {
  it('deletes reminder', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser1LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dueAt,
        note: 'To be deleted',
      });

    const reminderId = createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/v1/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);

    const getResponse = await request(app)
      .get('/api/v1/reminders')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    const deletedReminder = getResponse.body.data.find((r: any) => r.id === reminderId);
    expect(deletedReminder).toBeUndefined();
  });

  it('returns 404 for another users reminder', async () => {
    const dueAt = new Date(Date.now() + 86400000).toISOString();
    const createResponse = await request(app)
      .post(`/api/v1/leads/${testUser2LeadId}/reminders`)
      .set('Authorization', `Bearer ${testUser2Token}`)
      .send({
        dueAt,
        note: 'User 2 reminder to delete',
      });

    const reminderId = createResponse.body.data.id;

    await request(app)
      .delete(`/api/v1/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(404);
  });
});
