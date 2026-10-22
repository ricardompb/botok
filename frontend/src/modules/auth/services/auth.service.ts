import { http } from '../../../shared/api/http-client';
import type { AuthResponseDto, LoginDto, MeResponseDto } from '../dto/auth.dto';

export const authService = {
  login: (dto: LoginDto) => http.post<AuthResponseDto>('/auth/login', dto).then((r) => r.data),
  /** Após o login na Microsoft: vincula a conta e retorna o perfil do portal. */
  entraSession: () => http.post<MeResponseDto>('/auth/entra/session').then((r) => r.data),
  me: () => http.get<MeResponseDto>('/auth/me').then((r) => r.data),
};
