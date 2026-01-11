export class ScoreUpdatedEvent {
  matchId: string;
  innings: number;
  runs: number;
  wickets: number;
  timestamp?: number;

  constructor(data: Partial<ScoreUpdatedEvent>) {
    this.matchId = data.matchId ?? '';
    this.innings = data.innings ?? 1;
    this.runs = data.runs ?? 0;
    this.wickets = data.wickets ?? 0;
    this.timestamp = data.timestamp ?? Date.now();
  }
}
