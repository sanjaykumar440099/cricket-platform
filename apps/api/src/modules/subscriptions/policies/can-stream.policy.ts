export function canStream(user: any, matchId?: string): boolean {
  // Basic check: user must be authenticated and have an active streaming subscription or permission
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.subscription && user.subscription.active) return true;
  if (Array.isArray(user.permissions) && user.permissions.includes('stream:live')) return true;
  return false;
}
