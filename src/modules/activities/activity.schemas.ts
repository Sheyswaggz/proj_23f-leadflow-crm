import { z } from 'zod';

export const createActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid activity type' }),
  }),
  content: z.string().min(1, 'Content is required').max(5000),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
