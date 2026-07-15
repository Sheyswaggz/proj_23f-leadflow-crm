import prisma from '../../lib/prisma.js';
import { AppError } from '../../types/index.js';
import { CreateReminderInput, UpdateReminderInput } from './reminder.schemas.js';

class ReminderService {
  async createReminder(userId: string, leadId: string, input: CreateReminderInput) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    return prisma.followUpReminder.create({
      data: {
        leadId,
        userId,
        dueAt: new Date(input.dueAt),
        note: input.note,
      },
    });
  }

  async listByLead(userId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    return prisma.followUpReminder.findMany({
      where: { leadId, userId },
      orderBy: { dueAt: 'asc' },
    });
  }

  async listByUser(userId: string, status?: string) {
    const where: any = { userId };
    const now = new Date();

    if (status === 'overdue') {
      where.dueAt = { lt: now };
      where.isCompleted = false;
    } else if (status === 'upcoming') {
      where.dueAt = { gte: now };
      where.isCompleted = false;
    }

    return prisma.followUpReminder.findMany({
      where,
      orderBy: { dueAt: 'asc' },
    });
  }

  async updateReminder(userId: string, reminderId: string, input: UpdateReminderInput) {
    const reminder = await prisma.followUpReminder.findFirst({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new AppError('Reminder not found', 404);
    }

    const updateData: any = {};

    if (input.dueAt !== undefined) {
      updateData.dueAt = new Date(input.dueAt);
    }

    if (input.note !== undefined) {
      updateData.note = input.note;
    }

    if (input.isCompleted !== undefined) {
      updateData.isCompleted = input.isCompleted;
      if (input.isCompleted === true) {
        updateData.completedAt = new Date();
      }
    }

    return prisma.followUpReminder.update({
      where: { id: reminderId },
      data: updateData,
    });
  }

  async deleteReminder(userId: string, reminderId: string) {
    const reminder = await prisma.followUpReminder.findFirst({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new AppError('Reminder not found', 404);
    }

    return prisma.followUpReminder.delete({
      where: { id: reminderId },
    });
  }
}

export const reminderService = new ReminderService();
