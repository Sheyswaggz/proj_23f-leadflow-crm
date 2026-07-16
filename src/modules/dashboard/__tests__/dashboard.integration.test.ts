import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import prisma from '../../../lib/prisma.js';
import { LeadStage } from '../../leads/lead.schemas.js';

const app = createApp();

let testUser1Token: string;
let testUser1Id: string;
let testUser2Token: string;
let testUser2Id: string;
let testLeadIds: string[] = [];

beforeAll(async () => {
  await prisma.$connect();

  const user1Email = `dashtest1${Date.now()}@example.com`;
  const user1Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user1Email,
      password: 'password123',
      name: 'Dashboard Test User 1',
    });

  testUser1Token = user1Response.body.data.token;
  testUser1Id = user1Response.body.data.user.id;

  const user2Email = `dashtest2${Date.now()}@example.com`;
  const user2Response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: user2Email,
      password: 'password123',
      name: 'Dashboard Test User 2',
    });

  testUser2Token = user2Response.body.data.token;
  testUser2Id = user2Response.body.data.user.id;

  const leadStages = [
    LeadStage.NEW,
    LeadStage.NEW,
    LeadStage.CONTACTED,
    LeadStage.QUALIFIED,
    LeadStage.PROPOSAL_SENT,
    LeadStage.CLOSED_WON,
  ];

  for (const [index, stage] of leadStages.entries()) {
    const leadResponse = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: `Test Lead ${index + 1}`,
        company: `Company ${index + 1}`,
        stage,
      });

    testLeadIds.push(leadResponse.body.data.id);
  }

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.followUpReminder.create({
    data: {
      userId: testUser1Id,
      leadId: testLeadIds[0],
      dueAt: twoDaysAgo,
      note: 'Overdue reminder 1',
      isCompleted: false,
    },
  });

  await prisma.followUpReminder.create({
    data: {
      userId: testUser1Id,
      leadId: testLeadIds[1],
      dueAt: fiveDaysAgo,
      note: 'Overdue reminder 2',
      isCompleted: false,
    },
  });

  await prisma.followUpReminder.create({
    data: {
      userId: testUser1Id,
      leadId: testLeadIds[2],
      dueAt: threeDaysFromNow,
      note: 'Upcoming reminder 1',
      isCompleted: false,
    },
  });

  await prisma.followUpReminder.create({
    data: {
      userId: testUser1Id,
      leadId: testLeadIds[3],
      dueAt: fiveDaysFromNow,
      note: 'Upcoming reminder 2',
      isCompleted: false,
    },
  });

  await prisma.followUpReminder.create({
    data: {
      userId: testUser1Id,
      leadId: testLeadIds[4],
      dueAt: thirtyDaysFromNow,
      note: 'Far future reminder',
      isCompleted: false,
    },
  });

  await request(app)
    .post('/api/v1/leads')
    .set('Authorization', `Bearer ${testUser2Token}`)
    .send({
      name: 'User 2 Lead',
      company: 'User 2 Company',
      stage: LeadStage.NEW,
    });
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

describe('GET /api/v1/dashboard/stats', () => {
  it('returns all 6 stages in leadsByStage with correct counts', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.leadsByStage).toBeDefined();

    const { leadsByStage } = response.body.data;
    expect(leadsByStage[LeadStage.NEW]).toBe(2);
    expect(leadsByStage[LeadStage.CONTACTED]).toBe(1);
    expect(leadsByStage[LeadStage.QUALIFIED]).toBe(1);
    expect(leadsByStage[LeadStage.PROPOSAL_SENT]).toBe(1);
    expect(leadsByStage[LeadStage.CLOSED_WON]).toBe(1);
    expect(leadsByStage[LeadStage.CLOSED_LOST]).toBe(0);
  });

  it('returns 0 for stages with no leads', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    const { leadsByStage } = response.body.data;
    expect(leadsByStage[LeadStage.CLOSED_LOST]).toBe(0);
  });

  it('returns upcoming reminders within 7 days only', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.upcomingReminders).toBeDefined();
    expect(Array.isArray(response.body.data.upcomingReminders)).toBe(true);
    expect(response.body.data.upcomingReminders.length).toBe(2);

    const reminderNotes = response.body.data.upcomingReminders.map(
      (r: any) => r.note
    );
    expect(reminderNotes).toContain('Upcoming reminder 1');
    expect(reminderNotes).toContain('Upcoming reminder 2');
    expect(reminderNotes).not.toContain('Far future reminder');
    expect(reminderNotes).not.toContain('Overdue reminder 1');
    expect(reminderNotes).not.toContain('Overdue reminder 2');

    response.body.data.upcomingReminders.forEach((reminder: any) => {
      expect(reminder.lead).toBeDefined();
      expect(reminder.lead.id).toBeDefined();
      expect(reminder.lead.name).toBeDefined();
      expect(reminder.lead.company).toBeDefined();
    });
  });

  it('returns correct overdueCount = 2', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.overdueCount).toBe(2);
  });

  it('returns recentLeads ordered by updatedAt desc, max 5', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.recentLeads).toBeDefined();
    expect(Array.isArray(response.body.data.recentLeads)).toBe(true);
    expect(response.body.data.recentLeads.length).toBeLessThanOrEqual(5);
    expect(response.body.data.recentLeads.length).toBeGreaterThan(0);

    response.body.data.recentLeads.forEach((lead: any) => {
      expect(lead.id).toBeDefined();
      expect(lead.name).toBeDefined();
      expect(lead.stage).toBeDefined();
      expect(lead.updatedAt).toBeDefined();
    });

    const dates = response.body.data.recentLeads.map((lead: any) =>
      new Date(lead.updatedAt).getTime()
    );
    const sortedDates = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sortedDates);
  });

  it('returns 401 without token', async () => {
    await request(app)
      .get('/api/v1/dashboard/stats')
      .expect(401);
  });

  it('does not include other users data', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(response.body.success).toBe(true);

    const leadNames = response.body.data.recentLeads.map((lead: any) => lead.name);
    expect(leadNames).not.toContain('User 2 Lead');

    const allStageCount = Object.values(response.body.data.leadsByStage).reduce(
      (sum: number, count) => sum + (count as number),
      0
    );
    expect(allStageCount).toBe(6);
  });
});
