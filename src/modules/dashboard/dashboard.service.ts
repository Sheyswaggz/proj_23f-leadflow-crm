import prisma from '../../lib/prisma.js';
import { LeadStage } from '../leads/lead.schemas.js';

export class DashboardService {
  async getStats(userId: string) {
    const now = new Date();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [leadsByStageRaw, upcomingReminders, overdueCount, recentLeads] = await Promise.all([
      prisma.lead.groupBy({
        by: ['stage'],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.followUpReminder.findMany({
        where: {
          userId,
          isCompleted: false,
          dueAt: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
        orderBy: { dueAt: 'asc' },
        take: 10,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              company: true,
            },
          },
        },
      }),
      prisma.followUpReminder.count({
        where: {
          userId,
          isCompleted: false,
          dueAt: { lt: now },
        },
      }),
      prisma.lead.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          company: true,
          stage: true,
          updatedAt: true,
        },
      }),
    ]);

    const leadsByStage: Record<LeadStage, number> = {
      [LeadStage.NEW]: 0,
      [LeadStage.CONTACTED]: 0,
      [LeadStage.QUALIFIED]: 0,
      [LeadStage.PROPOSAL_SENT]: 0,
      [LeadStage.CLOSED_WON]: 0,
      [LeadStage.CLOSED_LOST]: 0,
    };

    leadsByStageRaw.forEach((item) => {
      leadsByStage[item.stage as LeadStage] = item._count._all;
    });

    return {
      leadsByStage,
      upcomingReminders,
      overdueCount,
      recentLeads,
    };
  }
}

export const dashboardService = new DashboardService();
