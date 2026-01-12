export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | null;

export interface BallEvent {
  over: number;          // over number (0-based or 1-based, be consistent)
  ball: number;          // ball attempt number

  runsOffBat: number;    // runs scored off the bat
  extras: number;        // extra runs
  extraType: ExtraType;  // type of extra

  isWicket: boolean;
  dismissedPlayerId?: string;

  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
}
