import prisma from '../../lib/prisma.js';
import { AppError } from '../../types/index.js';
import { CreateActivityInput } from './activity.schemas.js';

export class ActivityService {
  async createActivity(userId: string, leadId: string, input: CreateActivityInput) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        userId,
      },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    const activity = await prisma.activityLog.create({
      data: {
        leadId,
        userId,
        type: input.type,
        content: input.content,
      },
    });

    return activity;
  }

  async listActivities(userId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        userId,
      },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    const activities = await prisma.activityLog.findMany({
      where: {
        leadId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return activities;
  }
}

export const activityService = new ActivityService();
