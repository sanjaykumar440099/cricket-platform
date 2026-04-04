import { InningsState } from "./domain/innings.state";

export class ScoreProjector {
  static fromState(state: InningsState) {
    const totalBalls =
      state.completedOvers * 6 + state.ballsInOver;
    const oversAsNumber = totalBalls / 6;
    const overs =
      `${state.completedOvers}.${state.ballsInOver}`;

    return {
      runs: state.totalRuns,
      wickets: state.wickets,
      overs,
      runRate:
        oversAsNumber > 0
          ? +(state.totalRuns / oversAsNumber).toFixed(2)
          : 0,
    };
  }
}
