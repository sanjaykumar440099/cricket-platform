import { BallEvent } from './domain/ball.event';
import { InningsState } from './domain/innings.state';
import { ScoringRules } from './domain/scoring.rules';
import { ODI_POWERPLAYS } from './domain/powerplay.config';
import { BallEventDto } from './dto/ball-event.dto';
export class ScoringEngine {
  static applyBall(state: InningsState, event: BallEvent): InningsState {

    if (state.isCompleted) {
      return state;
    }

    let { totalRuns, wickets, completedOvers, ballsInOver, strikerId, nonStrikerId } = state;

    const currentOver = completedOvers;
    const phase =
      ODI_POWERPLAYS.find(
        p => currentOver >= p.fromOver && currentOver < p.toOver,
      ) ?? null;

    const powerplayPhase = phase?.name ?? null;
    const maxFieldersOutside = phase?.maxFieldersOutside ?? 5;

    // 0️⃣ Capture previous flags
    let { isFreeHit } = state;

    // 1️⃣ Add runs
    totalRuns += ScoringRules.totalRuns(event);

    // 2️⃣ Handle wicket
    if (event.isWicket) {
      wickets += 1;
      if (!isFreeHit) {
        wickets += 1;
      }
    }

    // 3️⃣ Free hit logic
    if (event.extraType === 'no-ball') {
      isFreeHit = true;
    } else if (ScoringRules.isLegalDelivery(event)) {
      isFreeHit = false;
    }

    // 4️⃣ Powerplay logic
    const overNumber = completedOvers;
    const isPowerplay = overNumber < 6; // T20 default (configurable)

    // 5 Handle legal delivery
    if (ScoringRules.isLegalDelivery(event)) {
      ballsInOver += 1;
    }

    // 6 Strike rotation (before over end)
    if (ScoringRules.shouldRotateStrike(event)) {
      [strikerId, nonStrikerId] = [nonStrikerId, strikerId];
    }

    // 7 End of over logic
    if (ScoringRules.isOverComplete(ballsInOver)) {
      completedOvers += 1;
      ballsInOver = 0;

      // Rotate strike at end of over
      [strikerId, nonStrikerId] = [nonStrikerId, strikerId];
    }

    return {
      ...state,
      totalRuns,
      wickets,
      completedOvers,
      ballsInOver,
      strikerId,
      nonStrikerId,

      powerplayPhase,
      maxFieldersOutside,

      isFreeHit,
    };
  }

  calculateScore(balls: BallEventDto[]) {
    let runs = 0;
    let wickets = 0;
    let validBalls = 0;

    for (const ball of balls) {
      runs += ball.runs + (ball.extraRuns || 0);

      if (ball.isWicket) wickets++;

      if (ball.extraType !== 'wide' && ball.extraType !== 'no-ball') {
        validBalls++;
      }
    }

    const overs = `${Math.floor(validBalls / 6)}.${validBalls % 6}`;

    return { runs, wickets, overs };
  }
}
