import { http } from '../../../shared/api/http-client';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { UserResponseDto } from '../dto/user-response.dto';

export const usersService = {
  listByCompany: (companyId: number) =>
    http.get<UserResponseDto[]>('/users', { params: { companyId } }).then((r) => r.data),
  create: (dto: CreateUserDto) => http.post<UserResponseDto>('/users', dto).then((r) => r.data),
  setActive: (id: string, active: boolean) =>
    http.patch<UserResponseDto>(`/users/${id}/status`, { active }).then((r) => r.data),
};
