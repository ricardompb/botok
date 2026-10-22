import type { Company } from '../companies/entities/company.entity.js';
import type { Agent } from './entities/agent.entity.js';

/** Agente que pode ser liberado para a empresa (genérico ou exclusivo dela). */
export function canBeGranted(agent: Agent, companyId: number) {
  return agent.scope === 'generic' || agent.tenantId === companyId;
}

export function isEligible(agent: Agent, companyId: number) {
  return agent.status === 'active' && canBeGranted(agent, companyId);
}

/** Contratado pela empresa e elegível para uso. */
export function isAvailableTo(agent: Agent, company: Company) {
  return (
    company.allowedAgents.some((a) => a.id === agent.id) &&
    isEligible(agent, company.id)
  );
}
