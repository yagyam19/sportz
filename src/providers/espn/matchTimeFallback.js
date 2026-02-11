export function shouldAssumeLive(match, now = new Date()) {
  if (match.status !== 'scheduled') return false;

  const startTime = new Date(match.startTime);

  // ESPN can lag; allow a grace window
  const LIVE_GRACE_MINUTES = 10;

  return now >= new Date(startTime.getTime() + LIVE_GRACE_MINUTES * 60_000);
}
