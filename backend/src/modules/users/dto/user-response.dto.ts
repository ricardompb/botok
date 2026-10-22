import type { User } from '../entities/user.entity.js';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  active: boolean;
  lastAccessAt: string | null;

  static from(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      lastAccessAt: user.lastAccessAt?.toISOString() ?? null,
    };
  }
}
