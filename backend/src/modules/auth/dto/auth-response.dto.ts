import type { UserRole } from '../../../common/auth/auth-user.js';
import type { User } from '../../users/entities/user.entity.js';

export class MeResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: { id: number; name: string } | null;

  static from(user: User): MeResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company ? { id: user.company.id, name: user.company.name } : null,
    };
  }
}

export class AuthResponseDto {
  accessToken: string;
  user: MeResponseDto;
}
