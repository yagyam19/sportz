import { z } from 'zod';

/**
 * Query schema: list commentary
 * - optional limit
 * - coerced positive integer
 * - max 100
 */
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Schema: create commentary
 */
export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().min(0),

  sequence: z.coerce.number().int().min(0),

  period: z.string().optional(),

  eventType: z.string().optional(),

  actor: z.string().optional(),

  team: z.string().optional(),

  message: z.string().min(1, 'Message is required'),

  metadata: z.record(z.string(), z.any()).optional(),

  tags: z.array(z.string()).optional(),
});
