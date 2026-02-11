export const ESPN_REGISTRY = [
  /* ===================== */
  /* ⚽ FOOTBALL / SOCCER  */
  /* ===================== */
  { sport: 'soccer', league: 'eng.1', label: 'Premier League' },
  { sport: 'soccer', league: 'esp.1', label: 'LaLiga' },
  { sport: 'soccer', league: 'ita.1', label: 'Serie A' },
  { sport: 'soccer', league: 'ger.1', label: 'Bundesliga' },
  { sport: 'soccer', league: 'fra.1', label: 'Ligue 1' },
  { sport: 'soccer', league: 'uefa.champions', label: 'UEFA Champions League' },
  { sport: 'soccer', league: 'uefa.europa', label: 'UEFA Europa League' },
  { sport: 'soccer', league: 'fifa.world', label: 'FIFA World Cup' },

  /* ===================== */
  /* 🏏 CRICKET            */
  /* ===================== */
  { sport: 'cricket', league: 'ipl', label: 'IPL' },
  { sport: 'cricket', league: 't20-world-cup', label: 'T20 World Cup' },
  { sport: 'cricket', league: 'icc.world-test-championship', label: 'WTC' },
  { sport: 'cricket', league: 'odi-world-cup', label: 'ODI World Cup' },
  { sport: 'cricket', league: 'big-bash-league', label: 'BBL' },
  { sport: 'cricket', league: 'the-hundred', label: 'The Hundred' },

  /* ===================== */
  /* 🏀 BASKETBALL         */
  /* ===================== */
  { sport: 'basketball', league: 'nba', label: 'NBA' },
  { sport: 'basketball', league: 'wnba', label: 'WNBA' },
  { sport: 'basketball', league: 'euroleague', label: 'EuroLeague' },

  /* ===================== */
  /* 🏈 AMERICAN FOOTBALL  */
  /* ===================== */
  { sport: 'football', league: 'nfl', label: 'NFL' },
  { sport: 'football', league: 'college-football', label: 'NCAA Football' },

  /* ===================== */
  /* ⚾ BASEBALL           */
  /* ===================== */
  { sport: 'baseball', league: 'mlb', label: 'MLB' },

  /* ===================== */
  /* 🎾 TENNIS             */
  /* ===================== */
  { sport: 'tennis', league: 'atp', label: 'ATP Tour' },
  { sport: 'tennis', league: 'wta', label: 'WTA Tour' },

  /* ===================== */
  /* 🏎️ MOTORSPORTS        */
  /* ===================== */
  { sport: 'racing', league: 'f1', label: 'Formula 1' },
  { sport: 'racing', league: 'motogp', label: 'MotoGP' },
];


export const ESPN_SPORTS = {
  football: {
    id: 28,
    name: "American Football",
    leagues: ["NFL", "NCAA"]
  },

  basketball: {
    id: 46,
    name: "Basketball",
    leagues: ["NBA", "WNBA", "NCAA"]
  },

  baseball: {
    id: 1,
    name: "Baseball",
    leagues: ["MLB", "NCAA"]
  },

  hockey: {
    id: 90,
    name: "Ice Hockey",
    leagues: ["NHL"]
  },

  soccer: {
    id: 600,
    name: "Soccer / Football",
    leagues: ["EPL", "LaLiga", "Bundesliga", "Serie A", "MLS", "UCL"]
  },

  cricket: {
    id: 10904,
    name: "Cricket",
    leagues: ["International", "IPL", "BBL", "CPL"]
  },

  tennis: {
    id: 850,
    name: "Tennis",
    leagues: ["ATP", "WTA", "Grand Slams"]
  },

  golf: {
    id: 110,
    name: "Golf",
    leagues: ["PGA", "LPGA"]
  },

  boxing: {
    id: 34,
    name: "Boxing"
  },

  mma: {
    id: 500,
    name: "Mixed Martial Arts",
    leagues: ["UFC"]
  },

  motorsports: {
    id: 2000,
    name: "Motorsports",
    leagues: ["F1", "NASCAR", "MotoGP"]
  },

  rugby: {
    id: 300,
    name: "Rugby",
    leagues: ["Union", "League"]
  },

  olympics: {
    id: 275,
    name: "Olympics"
  }
};
