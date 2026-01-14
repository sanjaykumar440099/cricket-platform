export interface MatchSummaryDto {
  matchId: string;
  teamAId: string;
  teamBId: string;
  status: string;
  winnerTeamId: string | null;
}
