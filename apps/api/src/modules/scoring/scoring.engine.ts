import { BallEvent } from './domain/ball.event';
import { InningsState } from './domain/innings.state';
import { ScoringRules } from './domain/scoring.rules';
import { ODI_POWERPLAYS } from './domain/powerplay.config';
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

  static calculateScore(state: InningsState) {
    const balls = state.completedOvers * 6 + state.ballsInOver;
    const overs = state.completedOvers + state.ballsInOver / 6;

    return {
      runs: state.totalRuns,
      wickets: state.wickets,
      overs,
      balls,
      runRate: overs > 0 ? state.totalRuns / overs : 0,
    };
  }
}
