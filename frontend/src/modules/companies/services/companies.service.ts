import { http } from '../../../shared/api/http-client';
import type { CompanyDetailDto, CompanyListItemDto, CreateCompanyDto } from '../dto/company.dto';

export const companiesService = {
  list: () => http.get<CompanyListItemDto[]>('/companies').then((r) => r.data),
  findById: (id: number) => http.get<CompanyDetailDto>(`/companies/${id}`).then((r) => r.data),
  create: (dto: CreateCompanyDto) => http.post<{ id: number }>('/companies', dto).then((r) => r.data),
  updateEntitlements: (id: number, agentIds: string[]) =>
    http.put<void>(`/companies/${id}/entitlements`, { agentIds }).then(() => undefined),
};
