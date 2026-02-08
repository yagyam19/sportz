import { Router } from 'express';
import { matches } from '../db/schema.js';
import { getMatchStatus } from '../utils/match-status.js';
import { db } from '../db/db.js';
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from '../validation/matches.js';
import { desc } from 'drizzle-orm';

export const matchRouter = Router();
const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid Query',
      details: JSON.stringify(parsed.error),
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    // get matches from the db
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    return res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list matches.',
      details: JSON.stringify(error),
    });
  }
});

matchRouter.post('/', async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid payload',
      details: JSON.stringify(parsed.error),
    });
  }

  try {
    // insert new match in database
    const { data: { startTime, endTime, homeScore, awayScore, ...rest } = {} } =
      parsed;

    const [event] = await db
      .insert(matches)
      .values({
        ...rest,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    res.status(201).json({ data: event });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create match.',
      details: JSON.stringify(error),
    });
  }
});
