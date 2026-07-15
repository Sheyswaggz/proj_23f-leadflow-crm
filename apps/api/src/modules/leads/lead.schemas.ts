import { z } from 'zod';

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(50, 'Phone must be at most 50 characters').optional(),
  company: z.string().max(200, 'Company must be at most 200 characters').optional(),
  jobTitle: z.string().max(200, 'Job title must be at most 200 characters').optional(),
  stage: z.nativeEnum(LeadStage).optional().default(LeadStage.NEW),
  notes: z.string().optional(),
  dealValue: z.number().positive('Deal value must be positive').optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial();

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(20),
  stage: z.nativeEnum(LeadStage).optional(),
  search: z.string().optional(),
});

export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
