import { z } from 'zod';

/**
 * Match status constants
 */
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

/**
 * Query schema: list matches
 * - optional limit
 * - coerced positive integer
 * - max 100
 */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Params schema: match ID
 * - required
 * - coerced positive integer
 */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Utility: ISO date validation
 */
const isoDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid ISO date string',
  });

/**
 * Schema: create match
 */
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'Sport is required'),
    homeTeam: z.string().min(1, 'Home team is required'),
    awayTeam: z.string().min(1, 'Away team is required'),

    startTime: isoDateString,
    endTime: isoDateString,

    homeScore: z.coerce.number().int().min(0).optional(),

    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime);
    const end = Date.parse(data.endTime);

    if (end <= start) {
      ctx.addIssue({
        path: ['endTime'],
        message: 'endTime must be after startTime',
        code: z.ZodIssueCode.custom,
      });
    }
  });

/**
 * Schema: update score
 */
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),

  awayScore: z.coerce.number().int().min(0),
});
