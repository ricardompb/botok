import { http } from '../../../shared/api/http-client';
import type { AdminStatsDto, AgentUsageDto } from '../dto/dashboard.dto';

export const dashboardService = {
  stats: () => http.get<AdminStatsDto>('/dashboard/stats').then((r) => r.data),
  usage: () => http.get<AgentUsageDto[]>('/dashboard/usage').then((r) => r.data),
};
