import { z } from 'zod';

export const createReminderSchema = z.object({
  dueAt: z.string().datetime({ message: 'dueAt must be a valid ISO 8601 datetime' }),
  note: z.string().max(1000).optional(),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;

export const updateReminderSchema = z.object({
  dueAt: z.string().datetime().optional(),
  note: z.string().max(1000).optional(),
  isCompleted: z.boolean().optional(),
});

export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

export const listRemindersQuerySchema = z.object({
  status: z.enum(['overdue', 'upcoming', 'all']).optional().default('all'),
});

export type ListRemindersQuery = z.infer<typeof listRemindersQuerySchema>;
