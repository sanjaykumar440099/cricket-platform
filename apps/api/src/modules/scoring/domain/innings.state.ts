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

  powerplayPhase: string | null;   // e.g. 'PP1', 'PP2'
  maxFieldersOutside: number;

  // 🔹 Free hit
  isFreeHit: boolean;
}
