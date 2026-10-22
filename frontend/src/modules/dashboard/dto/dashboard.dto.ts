export interface AdminStatsDto {
  companies: number;
  licenses: number;
  activeUsers: number;
  activeAgents: number;
}

export interface AgentUsageDto {
  agentId: string;
  name: string;
  sessions: number;
}
