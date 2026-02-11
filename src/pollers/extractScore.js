export function extractScoreFromPlayByPlay(data) {
  const competition = data?.competitions?.[0];
  if (!competition?.competitors || competition.competitors.length < 2) {
    return null;
  }

  const [home, away] = competition.competitors;

  const homeScore = Number(home.score);
  const awayScore = Number(away.score);

  if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    return null;
  }

  return { homeScore, awayScore };
}
