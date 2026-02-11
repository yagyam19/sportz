import cron from 'node-cron';
import { pollMatches } from '../pollers/espnMatchesPoller.js';
import { pollCommentary } from '../pollers/espnCommentaryPoller.js';

export function startCrons({
  broadcastMatchCreated,
  broadcastMatchUpdated,
  broadcastMatchTransition,
  broadcastCommentary,
}) {
  console.log('⏱️ Starting ESPN cron jobs...');

  // Matches (scoreboard)
  cron.schedule('*/1 * * * *', async () => {
    await pollMatches({
      broadcastMatchCreated,
      broadcastMatchUpdated,
      broadcastMatchTransition,
    });
  });

  // Commentary (play-by-play + fallback)
  cron.schedule('*/15 * * * * *', async () => {
    await pollCommentary({
      broadcastCommentary,
      broadcastMatchUpdated,
      broadcastMatchTransition,
    });
  });
}
