export interface InningsState {
  battingTeamId: string;
  bowlingTeamId: string;

  totalRuns: number;
  wickets: number;

  completedOvers: number;   // completed overs
  ballsInOver: number;      // balls bowled in current over (0–5)

  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;

  isCompleted: boolean;
}
