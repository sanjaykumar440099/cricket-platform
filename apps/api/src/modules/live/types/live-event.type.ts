export interface LiveEvent<T = any> {
  eventId: number;
  payload: T;
  timestamp: number;
}
