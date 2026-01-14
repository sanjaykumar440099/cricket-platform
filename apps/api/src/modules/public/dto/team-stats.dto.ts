export interface TeamStatsDto {
  teamId: string;
  matches: number;
  runsFor: number;
  runsAgainst: number;
  oversFaced: number;
  oversBowled: number;
  netRunRate: number;
}
