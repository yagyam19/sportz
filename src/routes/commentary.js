import { Router } from 'express';
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from '../validation/commentary.js';
import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { matchIdParamSchema } from '../validation/matches.js';
import { desc, eq } from 'drizzle-orm';

const MAX_LIMIT = 100;

// Router must be created with mergeParams: true
export const commentaryRouter = Router({ mergeParams: true });

/**
 * GET /matches/:id/commentary
 */
commentaryRouter.get('/', async (req, res) => {
  // 1️⃣ Validate route params
  const paramsParsed = matchIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({
      error: 'Invalid match id',
      details: paramsParsed.error.format(),
    });
  }

  // 2️⃣ Validate query params
  const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: queryParsed.error.format(),
    });
  }

  const { id: matchId } = paramsParsed.data;

  // Default limit = 100, enforce safety cap
  const limit = Math.min(queryParsed.data.limit ?? MAX_LIMIT, MAX_LIMIT);

  try {
    // 3️⃣ Fetch commentary for match
    const events = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    return res.status(200).json({
      data: events,
      meta: {
        count: events.length,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch commentary:', error);

    return res.status(500).json({
      error: 'Failed to fetch commentary',
    });
  }
});

commentaryRouter.post('/', async (req, res) => {
  // 1️⃣ Validate route params
  console.log('🚀 ~ paramsParsed:', req.params);
  const paramsParsed = matchIdParamSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    return res.status(400).json({
      error: 'Invalid match id',
      details: paramsParsed.error.format(),
    });
  }

  // 2️⃣ Validate request body
  const bodyParsed = createCommentarySchema.safeParse(req.body);

  if (!bodyParsed.success) {
    return res.status(400).json({
      error: 'Invalid commentary payload',
      details: bodyParsed.error.format(),
    });
  }

  try {
    const { id: matchId } = paramsParsed.data;
    console.log('🚀 ~ matchId:', matchId);
    const payload = bodyParsed.data;

    // 3️⃣ Insert commentary into DB
    const [createdCommentary] = await db
      .insert(commentary)
      .values({
        matchId: Number(matchId),
        ...payload,
      })
      .returning();

    if (res?.app.locals.broadcastCommentary) {
      res?.app.locals.broadcastCommentary(matchId, createdCommentary);
    }

    return res.status(201).json({
      data: createdCommentary,
    });
  } catch (error) {
    console.error('Failed to create commentary:', error);

    return res.status(500).json({
      error: 'Failed to create commentary',
    });
  }
});
