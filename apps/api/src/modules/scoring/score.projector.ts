import { InningsState } from "./domain/innings.state";

export class ScoreProjector {
  static fromState(state: InningsState) {
    const overs =
      `${state.completedOvers}.${state.ballsInOver}`;

    return {
      runs: state.totalRuns,
      wickets: state.wickets,
      overs,
      runRate:
        state.completedOvers > 0
          ? +(state.totalRuns / state.completedOvers).toFixed(2)
          : 0,
    };
  }
}
