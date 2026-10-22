export type UserRole = 'admin' | 'user';

export interface LoginDto {
  email: string;
  password: string;
}

export interface MeResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: { id: number; name: string } | null;
}

export interface AuthResponseDto {
  accessToken: string;
  user: MeResponseDto;
}
