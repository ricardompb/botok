import type { Agent, AgentAuth, AgentScope, AgentStatus } from '../entities/agent.entity.js';

/** Dados exibidos ao usuário final (sem configuração de conexão). */
export class AgentPublicDto {
  id: string;
  name: string;
  short: string;
  icon: string;
  description: string;
  title: string;
  intro: string;
  prompts: string[];
  tip: string;
  manualUrl: string;
  manualVersion: string;

  static from(a: Agent): AgentPublicDto {
    return {
      id: a.id,
      name: a.name,
      short: a.short,
      icon: a.icon,
      description: a.description,
      title: a.title,
      intro: a.intro,
      prompts: a.prompts,
      tip: a.tip,
      manualUrl: a.manualUrl,
      manualVersion: a.manualVersion,
    };
  }
}

export class AgentSummaryDto {
  id: string;
  name: string;
  description: string;
}

export class CatalogResponseDto {
  available: AgentPublicDto[];
  others: AgentSummaryDto[];
}

/** Cadastro completo para o console de agentes. */
export class AgentAdminDto {
  id: string;
  internalName: string;
  name: string;
  short: string;
  description: string;
  title: string;
  prompts: string[];
  scope: AgentScope;
  clientId: number | null;
  clientName: string | null;
  status: AgentStatus;
  provider: string;
  endpoint: string;
  remoteId: string;
  auth: AgentAuth;
  secretRef: string;
  version: string;
  owner: string;
  approved: string | null;
  manualUrl: string;
  manualVersion: string;
  tested: boolean;
  linkedCompanies: number;
}

export class AgentAuditDto {
  action: string;
  author: string;
  at: string;
}
