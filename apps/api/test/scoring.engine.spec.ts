import { ScoringEngine } from '../src/modules/scoring/scoring.engine';

describe('ScoringEngine basic behaviors', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  it('applies simple run events', () => {
    const res = engine.applyEvent({ over: 0, ball: 1, runs: 1 });
    expect(res.applied).toBeTruthy();
    expect(res.aggregate.totalRuns()).toBe(1);
    expect(res.aggregate.totalWickets()).toBe(0);
  });

  it('applies boundary (4) and six correctly', () => {
    engine.applyEvent({ over: 0, ball: 1, type: 'boundary' });
    engine.applyEvent({ over: 0, ball: 2, type: 'six' });
    expect(engine.aggregate.totalRuns()).toBe(10);
  });

  it('counts wickets and balls and computes overs', () => {
    engine.applyEvent({ over: 0, ball: 1, runs: 0 });
    engine.applyEvent({ over: 0, ball: 2, wicket: true });
    // two legal deliveries => 0.2 overs (represented as 0.2 in InningsState.overs)
    const innings = engine.aggregate.innings[0];
    expect(innings.wickets).toBe(1);
    expect(innings.balls).toBe(2);
    expect(innings.overs).toBeCloseTo(0.2, 5);
  });

  it('handles extras (not counted as legal delivery in current rules)', () => {
    engine.applyEvent({ over: 0, ball: 1, extras: 1 });
    const innings = engine.aggregate.innings[0];
    expect(innings.balls).toBe(0);
    expect(innings.runs).toBe(1);
  });
});
