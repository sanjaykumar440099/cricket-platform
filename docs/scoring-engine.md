# Scoring Engine

This document explains the design and responsibilities of the scoring engine.

- Domain layer: `modules/scoring/domain` contains `BallModel`, `InningsState`, `ScoreAggregate`, and `scoring.rules`.
- Engine: `scoring.engine.ts` maps incoming events → `BallModel` → mutates `InningsState` via rules.
- Service: `scoring.service.ts` exposes `processEvent` for other modules to call.
- Events: scoring emits `ScoreUpdatedEvent` consumed by `modules/live` to notify clients.

### Goals
- Deterministic scoring logic for replays and audits.
- Small, testable pure functions in `scoring.rules.ts`.
- Ability to serialize/deserialize state for persistence.

(Include example event flows and unit-test expectations.)
