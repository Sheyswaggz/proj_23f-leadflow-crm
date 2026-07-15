import { Lead } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { AppError } from '../../types/index.js';
import { CreateLeadInput, ListLeadsQuery, UpdateLeadInput } from './lead.schemas.js';

export class LeadService {
  async createLead(userId: string, input: CreateLeadInput): Promise<Lead> {
    const lead = await prisma.lead.create({
      data: {
        userId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        jobTitle: input.jobTitle,
        stage: input.stage,
        notes: input.notes,
        dealValue: input.dealValue,
      },
    });

    return lead;
  }

  async listLeads(
    userId: string,
    query: ListLeadsQuery
  ): Promise<{
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, stage, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (stage) {
      where.stage = stage;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      leads,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getLeadById(userId: string, leadId: string): Promise<Lead> {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        userId,
      },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    }

    return lead;
  }

  async updateLead(userId: string, leadId: string, input: UpdateLeadInput): Promise<Lead> {
    await this.getLeadById(userId, leadId);

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: input,
    });

    return updatedLead;
  }

  async deleteLead(userId: string, leadId: string): Promise<void> {
    await this.getLeadById(userId, leadId);

    await prisma.lead.delete({
      where: { id: leadId },
    });
  }
}

export const leadService = new LeadService();
