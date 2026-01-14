export const CacheKeys = {
  liveScore: (matchId: string) => `live:score:${matchId}`,
  pointsTable: (tournamentId: string) => `points:${tournamentId}`,
  bracket: (tournamentId: string) => `bracket:${tournamentId}`,
  matchSummary: (matchId: string) => `match:${matchId}`,
};
