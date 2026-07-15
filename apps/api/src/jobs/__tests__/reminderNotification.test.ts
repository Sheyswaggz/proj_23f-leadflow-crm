import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { PrismaClient, FollowUpReminder, Lead, User } from '@prisma/client';

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    followUpReminder: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../../lib/email.js', () => ({
  emailService: {
    sendReminderNotificationEmail: vi.fn(),
  },
}));

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn((schedule: string, callback: () => void) => {
      (global as any).__cronCallback = callback;
      return { stop: vi.fn() };
    }),
  },
}));

import { prisma } from '../../lib/prisma.js';
import { emailService } from '../../lib/email.js';
import { startReminderNotificationJob } from '../reminderNotification.job.js';

describe('Reminder Notification Job', () => {
  const mockDate = new Date('2026-07-16T10:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(mockDate);
    delete process.env['REMINDER_NOTIFICATIONS_ENABLED'];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queries reminders due within 15 minutes with notifiedAt=null', async () => {
    const mockReminders: Array<
      FollowUpReminder & { lead: Pick<Lead, 'name'>; user: Pick<User, 'email' | 'name'> }
    > = [];

    vi.mocked(prisma.followUpReminder.findMany).mockResolvedValue(mockReminders);

    startReminderNotificationJob();
    await (global as any).__cronCallback();

    expect(prisma.followUpReminder.findMany).toHaveBeenCalledWith({
      where: {
        isCompleted: false,
        dueAt: {
          lte: new Date('2026-07-16T10:15:00.000Z'),
        },
        notifiedAt: null,
      },
      include: {
        lead: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  });

  it('sends email for each due reminder', async () => {
    const mockReminders: Array<
      FollowUpReminder & { lead: Pick<Lead, 'name'>; user: Pick<User, 'email' | 'name'> }
    > = [
      {
        id: 'reminder-1',
        leadId: 'lead-1',
        userId: 'user-1',
        dueAt: new Date('2026-07-16T10:10:00.000Z'),
        note: 'Follow up on proposal',
        isCompleted: false,
        completedAt: null,
        notifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lead: { name: 'Acme Corp' },
        user: { email: 'user@example.com', name: 'John Doe' },
      },
      {
        id: 'reminder-2',
        leadId: 'lead-2',
        userId: 'user-1',
        dueAt: new Date('2026-07-16T10:12:00.000Z'),
        note: null,
        isCompleted: false,
        completedAt: null,
        notifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lead: { name: 'TechStart Inc' },
        user: { email: 'user@example.com', name: 'John Doe' },
      },
    ];

    vi.mocked(prisma.followUpReminder.findMany).mockResolvedValue(mockReminders);
    vi.mocked(prisma.followUpReminder.update).mockResolvedValue({} as FollowUpReminder);
    vi.mocked(emailService.sendReminderNotificationEmail).mockResolvedValue(undefined);

    startReminderNotificationJob();
    await (global as any).__cronCallback();

    expect(emailService.sendReminderNotificationEmail).toHaveBeenCalledTimes(2);
    expect(emailService.sendReminderNotificationEmail).toHaveBeenCalledWith('user@example.com', {
      leadName: 'Acme Corp',
      dueAt: new Date('2026-07-16T10:10:00.000Z'),
      note: 'Follow up on proposal',
    });
    expect(emailService.sendReminderNotificationEmail).toHaveBeenCalledWith('user@example.com', {
      leadName: 'TechStart Inc',
      dueAt: new Date('2026-07-16T10:12:00.000Z'),
      note: null,
    });
  });

  it('updates notifiedAt after successful send', async () => {
    const mockReminders: Array<
      FollowUpReminder & { lead: Pick<Lead, 'name'>; user: Pick<User, 'email' | 'name'> }
    > = [
      {
        id: 'reminder-1',
        leadId: 'lead-1',
        userId: 'user-1',
        dueAt: new Date('2026-07-16T10:10:00.000Z'),
        note: 'Test note',
        isCompleted: false,
        completedAt: null,
        notifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lead: { name: 'Test Lead' },
        user: { email: 'test@example.com', name: 'Test User' },
      },
    ];

    vi.mocked(prisma.followUpReminder.findMany).mockResolvedValue(mockReminders);
    vi.mocked(prisma.followUpReminder.update).mockResolvedValue({} as FollowUpReminder);
    vi.mocked(emailService.sendReminderNotificationEmail).mockResolvedValue(undefined);

    startReminderNotificationJob();
    await (global as any).__cronCallback();

    expect(prisma.followUpReminder.update).toHaveBeenCalledWith({
      where: { id: 'reminder-1' },
      data: { notifiedAt: mockDate },
    });
  });

  it('does not crash on email send failure — logs error and continues', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockReminders: Array<
      FollowUpReminder & { lead: Pick<Lead, 'name'>; user: Pick<User, 'email' | 'name'> }
    > = [
      {
        id: 'reminder-1',
        leadId: 'lead-1',
        userId: 'user-1',
        dueAt: new Date('2026-07-16T10:10:00.000Z'),
        note: 'Test note',
        isCompleted: false,
        completedAt: null,
        notifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lead: { name: 'Test Lead 1' },
        user: { email: 'fail@example.com', name: 'Fail User' },
      },
      {
        id: 'reminder-2',
        leadId: 'lead-2',
        userId: 'user-2',
        dueAt: new Date('2026-07-16T10:11:00.000Z'),
        note: null,
        isCompleted: false,
        completedAt: null,
        notifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lead: { name: 'Test Lead 2' },
        user: { email: 'success@example.com', name: 'Success User' },
      },
    ];

    vi.mocked(prisma.followUpReminder.findMany).mockResolvedValue(mockReminders);
    vi.mocked(prisma.followUpReminder.update).mockResolvedValue({} as FollowUpReminder);
    vi.mocked(emailService.sendReminderNotificationEmail)
      .mockRejectedValueOnce(new Error('SMTP error'))
      .mockResolvedValueOnce(undefined);

    startReminderNotificationJob();
    await (global as any).__cronCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to send reminder reminder-1:',
      expect.any(Error)
    );
    expect(prisma.followUpReminder.update).toHaveBeenCalledTimes(1);
    expect(prisma.followUpReminder.update).toHaveBeenCalledWith({
      where: { id: 'reminder-2' },
      data: { notifiedAt: mockDate },
    });

    consoleSpy.mockRestore();
  });

  it('skips completed reminders', async () => {
    const mockReminders: Array<
      FollowUpReminder & { lead: Pick<Lead, 'name'>; user: Pick<User, 'email' | 'name'> }
    > = [];

    vi.mocked(prisma.followUpReminder.findMany).mockResolvedValue(mockReminders);

    startReminderNotificationJob();
    await (global as any).__cronCallback();

    expect(prisma.followUpReminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isCompleted: false,
        }),
      })
    );
  });

  it('skips already notified reminders', async () => {
    const mockReminders: Array<
      FollowUpReminder & { lead: Pick<Lead, 'name'>; user: Pick<User, 'email' | 'name'> }
    > = [];

    vi.mocked(prisma.followUpReminder.findMany).mockResolvedValue(mockReminders);

    startReminderNotificationJob();
    await (global as any).__cronCallback();

    expect(prisma.followUpReminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          notifiedAt: null,
        }),
      })
    );
  });

  it('does nothing when REMINDER_NOTIFICATIONS_ENABLED=false', async () => {
    process.env['REMINDER_NOTIFICATIONS_ENABLED'] = 'false';

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    startReminderNotificationJob();

    expect(consoleSpy).toHaveBeenCalledWith('Reminder notifications disabled');
    expect((global as any).__cronCallback).toBeUndefined();

    consoleSpy.mockRestore();
  });
});
