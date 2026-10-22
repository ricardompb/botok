import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type AgentScope = 'generic' | 'exclusive';
export type AgentStatus = 'draft' | 'active' | 'suspended' | 'archived';
export type AgentAuth = 'entra' | 'vault';

@Entity('agents')
export class Agent {
  @PrimaryColumn({ length: 60 })
  id: string;

  @Column('int', { default: 0 })
  sortOrder: number;

  @Column({ length: 160, unique: true })
  internalName: string;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 160 })
  short: string;

  @Column({ length: 30, default: 'chat' })
  icon: string;

  @Column({ length: 400 })
  description: string;

  @Column({ length: 160 })
  title: string;

  @Column('text')
  intro: string;

  @Column('jsonb', { default: [] })
  prompts: string[];

  @Column('text')
  tip: string;

  @Column({ length: 20 })
  scope: AgentScope;

  /** null: agente genérico do catálogo global; preenchido: exclusivo da empresa (tenant). */
  @Column('int', { nullable: true })
  tenantId: number | null;

  @Column({ length: 20 })
  status: AgentStatus;

  @Column({ length: 60 })
  provider: string;

  /** Endpoint do projeto Foundry: https://<recurso>.services.ai.azure.com/api/projects/<projeto> */
  @Column({ length: 500 })
  endpoint: string;

  /** Agente no Foundry: `nome` ou `nome:versão` (sem versão, usa a mais recente). */
  @Column({ length: 160 })
  remoteId: string;

  @Column({ length: 20 })
  auth: AgentAuth;

  /** Referência ao segredo no cofre — nunca o valor da chave. */
  @Column({ length: 160, default: '' })
  secretRef: string;

  @Column({ length: 160 })
  version: string;

  @Column({ length: 160 })
  owner: string;

  @Column('date', { nullable: true })
  approved: string | null;

  @Column({ length: 500, default: '' })
  manualUrl: string;

  @Column({ length: 160 })
  manualVersion: string;

  @Column({ default: false })
  tested: boolean;

  @CreateDateColumn({ default: () => 'clock_timestamp()' })
  createdAt: Date;
}
