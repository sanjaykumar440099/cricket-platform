import { BallEvent } from './ball.model';

export class ScoringRules {
  static isLegalDelivery(event: BallEvent): boolean {
    return event.extraType !== 'wide' && event.extraType !== 'no-ball';
  }

  static totalRuns(event: BallEvent): number {
    return event.runsOffBat + event.extras;
  }

  static shouldRotateStrike(event: BallEvent): boolean {
    return this.totalRuns(event) % 2 === 1;
  }

  static isOverComplete(ballsInOver: number): boolean {
    return ballsInOver === 6;
  }
}
