export const CacheKeys = {
  liveScore: (matchId: string) => `live:score:${matchId}`,
  pointsTable: (tournamentId: string) => `points:${tournamentId}`,
  bracket: (tournamentId: string) => `bracket:${tournamentId}`,
  matchSummary: (matchId: string) => `match:${matchId}`,
  liveEvents: (matchId: string) => `live:events:${matchId}`,
  matchLock: (matchId: string) => `lock:match:${matchId}`,
  scoreUpdate: (matchId: string) => `pub:score:${matchId}`,
  matchResume: (matchId: string) => `match:${matchId}:resume`,
  matchState: (matchId: string) => `match:${matchId}:state`,
  matchScore: (matchId: string) => `match:${matchId}:score`,
  matchSpectators: (matchId: string) => `match:${matchId}:spectators`,
  socketMatch: (socketId: string) => `socket:${socketId}:match`,
  matchSnapshot: (matchId: string) => `match:${matchId}:snapshot`,
  liveMatches: () => `matches:live`,
  userMatchSocket: (userId: string, matchId: string) => `user:${userId}:match:${matchId}`
};
