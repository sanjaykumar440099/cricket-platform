import { BallEvent } from './domain/ball.model';
import { InningsState } from './domain/innings.state';
import { ScoringRules } from './domain/scoring.rules';

export class ScoringEngine {
  static applyBall(
    state: InningsState,
    event: BallEvent,
  ): InningsState {
    if (state.isCompleted) {
      return state;
    }

    let {
      totalRuns,
      wickets,
      completedOvers,
      ballsInOver,
      strikerId,
      nonStrikerId,
    } = state;

    // 1️⃣ Add runs
    totalRuns += ScoringRules.totalRuns(event);

    // 2️⃣ Handle wicket
    if (event.isWicket) {
      wickets += 1;
    }

    // 3️⃣ Handle legal delivery
    if (ScoringRules.isLegalDelivery(event)) {
      ballsInOver += 1;
    }

    // 4️⃣ Strike rotation (before over end)
    if (ScoringRules.shouldRotateStrike(event)) {
      [strikerId, nonStrikerId] = [nonStrikerId, strikerId];
    }

    // 5️⃣ End of over logic
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
