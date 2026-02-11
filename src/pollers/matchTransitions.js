export function detectMatchTransition(prev, next) {
  if (prev === 'scheduled' && next === 'live') {
    return 'match_live';
  }

  if (prev === 'live' && next === 'finished') {
    return 'match_finished';
  }

  return null;
}
