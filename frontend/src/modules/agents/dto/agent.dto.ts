export type AgentScope = 'generic' | 'exclusive';
export type AgentStatus = 'draft' | 'active' | 'suspended' | 'archived';
export type AgentAuth = 'entra' | 'vault';

export interface AgentAdminDto {
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

export interface SaveAgentDto {
  internalName: string;
  name: string;
  short: string;
  status: AgentStatus;
  description: string;
  scope: AgentScope;
  clientId: number | null;
  version: string;
  owner: string;
  approved: string;
  title: string;
  prompts: string[];
  endpoint: string;
  remoteId: string;
  auth: AgentAuth;
  secretRef: string;
  manualUrl: string;
  manualVersion: string;
  tested: boolean;
}

export interface AgentAuditDto {
  action: string;
  author: string;
  at: string;
}
