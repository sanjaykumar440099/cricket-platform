export function canExport(user: any): boolean {
  // Allow export for admins or users with specific export permission
  if (!user) return false;
  if (user.isAdmin) return true;
  if (Array.isArray(user.permissions) && user.permissions.includes('data:export')) return true;
  return false;
}
