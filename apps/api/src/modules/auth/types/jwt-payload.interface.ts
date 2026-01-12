export interface JwtPayload {
  sub: string; // userId
  role: 'admin' | 'scorer' | 'viewer';
}
