import { UserRole } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  sub?: string;
}
