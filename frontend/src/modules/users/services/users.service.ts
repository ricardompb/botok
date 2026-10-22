import { http } from '../../../shared/api/http-client';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { UserResponseDto } from '../dto/user-response.dto';

/** Usuários de uma empresa (tenant explícito na rota). */
export const usersService = {
  listByCompany: (companyId: number) =>
    http.get<UserResponseDto[]>(`/companies/${companyId}/users`).then((r) => r.data),
  create: (companyId: number, dto: CreateUserDto) =>
    http.post<UserResponseDto>(`/companies/${companyId}/users`, dto).then((r) => r.data),
  setActive: (companyId: number, id: string, active: boolean) =>
    http.patch<UserResponseDto>(`/companies/${companyId}/users/${id}/status`, { active }).then((r) => r.data),
};
