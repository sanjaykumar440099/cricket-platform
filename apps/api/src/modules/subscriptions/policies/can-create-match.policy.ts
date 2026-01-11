export function canCreateMatch(user: any): boolean {
  // Allow admins or users with explicit permission to create matches
  if (!user) return false;
  if (user.isAdmin) return true;
  if (Array.isArray(user.permissions) && user.permissions.includes('match:create')) return true;
  return false;
}
