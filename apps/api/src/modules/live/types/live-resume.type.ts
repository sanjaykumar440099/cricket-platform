export interface LiveResumePayload<TState = any> {
  state: TState;
  lastEventId: number;
  updatedAt: number;
}
