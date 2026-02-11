import { db } from '../db/db.js';
import { matches, commentary } from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { mapEspnStatus } from '../providers/espn/mapStatus.js';
import { detectMatchTransition } from './matchTransitions.js';
import { extractScoreFromPlayByPlay } from './extractScore.js';
import { ESPN_SPORTS } from '../providers/espn/registry.js';

export async function pollCommentary({
  broadcastCommentary,
  broadcastMatchUpdated,
  broadcastMatchTransition,
}) {
  const matchesToPoll = await db
    .select()
    .from(matches)
    .where(inArray(matches.status, ['live']));
  console.log("🚀 ~ pollCommentary ~ matchesToPoll:", matchesToPoll)

  for (const match of matchesToPoll) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${match.sport}/${ESPN_SPORTS[match.sport].id}/playbyplay?event=${match.externalId}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("🚀 ~ pollCommentary ~ data:", data)

      /* 1️⃣ INSERT NEW COMMENTARY */
      if (data?.plays) {
        for (const play of data.plays) {
          const [row] = await db
            .insert(commentary)
            .values({
              matchId: match.id,
              minute: play.clock?.displayValue ?? 0,
              sequence: play.sequenceNumber,
              period: play.period?.number?.toString(),
              eventType: play.type?.text ?? 'event',
              actor: play.participants?.[0]?.athlete?.displayName,
              team: play.team?.displayName,
              message: play.text,
              metadata: play,
            })
            .onConflictDoNothing()
            .returning();

          if (row) {
            broadcastCommentary(match.id, {
              type: 'commentary_created',
              data: row,
            });
          }
        }
      }

      /* 2️⃣ STATUS FALLBACK */
      const nextStatus = mapEspnStatus(data?.status?.type?.state);

      if (nextStatus && nextStatus !== match.status) {
        const transition = detectMatchTransition(match.status, nextStatus);

        const [updated] = await db
          .update(matches)
          .set({ status: nextStatus })
          .where(eq(matches.id, match.id))
          .returning();

        if (updated && transition) {
          broadcastMatchTransition({
            type: transition,
            data: updated,
          });
        }
      }

      /* 3️⃣ SCORE FALLBACK */
      const score = extractScoreFromPlayByPlay(data);
      if (!score) continue;

      const scoreChanged =
        score.homeScore !== match.homeScore ||
        score.awayScore !== match.awayScore;

      if (!scoreChanged) continue;

      const [updatedScore] = await db
        .update(matches)
        .set({
          homeScore: score.homeScore,
          awayScore: score.awayScore,
        })
        .where(eq(matches.id, match.id))
        .returning();

      if (updatedScore) {
        broadcastMatchUpdated({
          type: 'match_score_updated',
          data: updatedScore,
        });
      }
    } catch (err) {
      console.error(`[Commentary Cron] Match ${match.id} failed`, err);
    }
  }
}
