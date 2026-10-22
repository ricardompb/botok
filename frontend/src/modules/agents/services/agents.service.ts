import { http } from '../../../shared/api/http-client';
import type { AgentAdminDto, AgentAuditDto, SaveAgentDto } from '../dto/agent.dto';

export const agentsService = {
  list: () => http.get<AgentAdminDto[]>('/agents').then((r) => r.data),
  audit: () => http.get<AgentAuditDto[]>('/agents/audit').then((r) => r.data),
  create: (dto: SaveAgentDto) => http.post<{ id: string }>('/agents', dto).then((r) => r.data),
  update: (id: string, dto: SaveAgentDto) => http.put<{ id: string }>(`/agents/${id}`, dto).then((r) => r.data),
  changeStatus: (id: string, status: 'suspended' | 'archived') =>
    http.patch<void>(`/agents/${id}/status`, { status }).then(() => undefined),
  remove: (id: string) => http.delete<void>(`/agents/${id}`).then(() => undefined),
};
