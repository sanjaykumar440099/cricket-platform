export interface LeaderboardRowDto {
  teamId: string;
  matches: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
  points: number;
  netRunRate: number;
}

export interface LeaderboardDto {
  tournamentId: string;
  table: LeaderboardRowDto[];
}
