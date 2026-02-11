import { mapEspnStatus } from './mapStatus.js';
import { shouldAssumeLive } from './matchTimeFallback.js';

export function resolveNextStatus(existing, espnEvent) {
  // ESPN did NOT return this match
  if (!espnEvent) {
    if (shouldAssumeLive(existing)) return 'live';
    return existing.status;
  }

  // ESPN returned the match
  const espnStatus = mapEspnStatus(espnEvent.status?.type);

  if (espnStatus === 'live') return 'live';
  if (espnStatus === 'finished') return 'finished';

  // ESPN still says scheduled — fallback to time
  if (shouldAssumeLive(existing)) return 'live';

  return 'scheduled';
}
