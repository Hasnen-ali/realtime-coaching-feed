import { z } from 'zod';

export const createFeedSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be at most 120 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(1200, 'Description must be at most 1200 characters'),
  clientRequestId: z.string().trim().max(80).optional()
});
