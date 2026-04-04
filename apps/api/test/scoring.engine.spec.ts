import { ScoringEngine } from '../src/modules/scoring/scoring.engine';
import { InningsState } from '../src/modules/scoring/domain/innings.state';
import { BallEvent } from '../src/modules/scoring/domain/ball.event';

function buildState(): InningsState {
  return {
    battingTeamId: 'team-a',
    bowlingTeamId: 'team-b',
    totalRuns: 0,
    wickets: 0,
    completedOvers: 0,
    ballsInOver: 0,
    strikerId: 'striker',
    nonStrikerId: 'non-striker',
    currentBowlerId: 'bowler',
    isCompleted: false,
    isPowerplay: true,
    powerplayPhase: 'PP1',
    maxFieldersOutside: 2,
    isFreeHit: false,
  };
}

function buildEvent(overrides: Partial<BallEvent> = {}): BallEvent {
  return {
    over: 0,
    ball: 1,
    runsOffBat: 0,
    extras: 0,
    extraType: null,
    isWicket: false,
    strikerId: 'striker',
    nonStrikerId: 'non-striker',
    bowlerId: 'bowler',
    ...overrides,
  };
}

describe('ScoringEngine', () => {
  it('adds runs from a legal delivery', () => {
    const next = ScoringEngine.applyBall(
      buildState(),
      buildEvent({ runsOffBat: 1 }),
    );

    expect(next.totalRuns).toBe(1);
    expect(next.wickets).toBe(0);
    expect(next.ballsInOver).toBe(1);
  });

  it('counts only one wicket for a normal dismissal', () => {
    const next = ScoringEngine.applyBall(
      buildState(),
      buildEvent({ isWicket: true }),
    );

    expect(next.wickets).toBe(1);
    expect(next.ballsInOver).toBe(1);
  });

  it('sets free hit after a no-ball and clears it after the next legal ball', () => {
    const afterNoBall = ScoringEngine.applyBall(
      buildState(),
      buildEvent({
        extraType: 'no-ball',
        extras: 1,
      }),
    );
    const afterLegalBall = ScoringEngine.applyBall(
      afterNoBall,
      buildEvent({ ball: 2, runsOffBat: 2 }),
    );

    expect(afterNoBall.isFreeHit).toBe(true);
    expect(afterNoBall.ballsInOver).toBe(0);
    expect(afterLegalBall.isFreeHit).toBe(false);
    expect(afterLegalBall.ballsInOver).toBe(1);
  });

  it('calculates a compact scoreboard from stored balls', () => {
    const engine = new ScoringEngine();
    const score = engine.calculateScore([
      {
        matchId: 'match-1',
        innings: 1,
        over: 0,
        ball: 1,
        runs: 1,
        isWicket: false,
      },
      {
        matchId: 'match-1',
        innings: 1,
        over: 0,
        ball: 2,
        runs: 4,
        isWicket: false,
      },
      {
        matchId: 'match-1',
        innings: 1,
        over: 0,
        ball: 3,
        runs: 0,
        extraRuns: 1,
        extraType: 'wide',
        isWicket: false,
      },
    ]);

    expect(score.runs).toBe(6);
    expect(score.wickets).toBe(0);
    expect(score.overs).toBe('0.2');
  });
});
