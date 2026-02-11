import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { mapEspnStatus } from '../providers/espn/mapStatus.js';
import { ESPN_REGISTRY } from '../providers/espn/registry.js';
import { eq, and } from 'drizzle-orm';
import { detectMatchTransition } from './matchTransitions.js';
import { shouldAssumeLive } from '../providers/espn/matchTimeFallback.js';


export async function pollMatches({
  broadcastMatchCreated,
  broadcastMatchUpdated,
  broadcastMatchTransition,
}) {
  for (const { sport, league } of ESPN_REGISTRY) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const espnEvents = data?.events ?? [];

      // 🔑 Index ESPN events by externalId
      const espnEventById = new Map(
        espnEvents.map(event => [event.id, event])
      );

      /**
       * -------------------------------
       * 1️⃣ HANDLE ESPN EVENTS (create / update)
       * -------------------------------
       */
      for (const event of espnEvents) {
        const competition = event.competitions?.[0];
        if (!competition) continue;

        const [home, away] = competition.competitors || [];

        const espnStatus = mapEspnStatus(event.status?.type);

        const incoming = {
          externalId: event.id,
          sport,
          league,
          homeTeam: home?.team?.displayName,
          awayTeam: away?.team?.displayName,
          status: espnStatus,
          startTime: new Date(event.date),
          homeScore: Number(home?.score) || 0,
          awayScore: Number(away?.score) || 0,
        };

        const [existing] = await db
          .select()
          .from(matches)
          .where(eq(matches.externalId, incoming.externalId));

        // 🆕 CREATE
        if (!existing) {
          const [created] = await db
            .insert(matches)
            .values(incoming)
            .returning();

          if (created) {
            broadcastMatchCreated({
              type: 'match_created',
              data: created,
            });
          }
          continue;
        }

        const transition = detectMatchTransition(
          existing.status,
          incoming.status
        );

        const scoreChanged =
          existing.homeScore !== incoming.homeScore ||
          existing.awayScore !== incoming.awayScore;

        const statusChanged = existing.status !== incoming.status;

        if (!scoreChanged && !statusChanged) continue;

        const [updated] = await db
          .update(matches)
          .set({
            status: incoming.status,
            homeScore: incoming.homeScore,
            awayScore: incoming.awayScore,
          })
          .where(eq(matches.id, existing.id))
          .returning();
        console.log("🚀 ~ pollMatches ~ updated:", updated)

        if (!updated) continue;

        if (transition) {
          broadcastMatchTransition({
            type: transition,
            data: updated,
          });
        }
      }

      /**
       * ----------------------------------------
       * 2️⃣ HANDLE DB MATCHES ESPN DID NOT RETURN
       * ----------------------------------------
       */
      const dbMatches = await db
        .select()
        .from(matches)
        .where(
          and(
            eq(matches.sport, sport),
            eq(matches.league, league)
          )
        );

      for (const existing of dbMatches) {
        // ESPN already handled it above
        if (espnEventById.has(existing.externalId)) continue;

        // ⏱️ Time-based fallback
        if (!shouldAssumeLive(existing)) continue;

        const nextStatus = 'live';

        const transition = detectMatchTransition(
          existing.status,
          nextStatus
        );

        if (!transition) continue;

        const [updated] = await db
          .update(matches)
          .set({ status: nextStatus })
          .where(eq(matches.id, existing.id))
          .returning();

        if (!updated) continue;

        broadcastMatchTransition({
          type: transition, // match_started
          data: updated,
        });
      }
    } catch (err) {
      console.error(`[Matches Cron] ${sport}/${league} failed`, err);
    }
  }
}
