export const CacheKeys = {
  liveScore: (matchId: string) => `live:score:${matchId}`,
  pointsTable: (tournamentId: string) => `points:${tournamentId}`,
  bracket: (tournamentId: string) => `bracket:${tournamentId}`,
  matchSummary: (matchId: string) => `match:${matchId}`,
  liveEvents: (matchId: string) => `live:events:${matchId}`,
  matchLock: (matchId: string) => `lock:match:${matchId}`,
  scoreUpdate: (matchId: string) => `pub:score:${matchId}`,
};
