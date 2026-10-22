export class AdminStatsDto {
  companies: number;
  licenses: number;
  activeUsers: number;
  activeAgents: number;
}

export class AgentUsageDto {
  agentId: string;
  name: string;
  sessions: number;
}
