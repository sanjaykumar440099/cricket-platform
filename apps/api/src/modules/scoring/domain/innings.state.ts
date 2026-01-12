export interface InningsState {
  battingTeamId: string;
  bowlingTeamId: string;

  totalRuns: number;
  wickets: number;

  completedOvers: number;
  ballsInOver: number;

  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;

  isCompleted: boolean;

  /** 🆕 Powerplay & Free Hit */
  isPowerplay: boolean;
  isFreeHit: boolean;
}
