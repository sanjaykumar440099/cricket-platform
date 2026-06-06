export interface LiveEvent<T = any> {
  eventId: number;
  matchId: string;
  payload: T;
  timestamp: number;
}
