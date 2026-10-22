import { BadRequestException } from '@nestjs/common';
import { validateAgent } from '../../agent-validation.js';
import type { SaveAgentDto } from '../../dto/save-agent.dto.js';
import type { Agent } from '../../entities/agent.entity.js';
import type { AgentsRepository } from '../../repositories/agents.repository.js';

export const AUDIT_AUTHOR = 'Administrador IT’s OK · demonstração';

/** Valida e normaliza o formulário de agente (comum a criação e edição). */
export async function buildAgentFields(
  repo: AgentsRepository,
  dto: SaveAgentDto,
  existing: Agent | null,
): Promise<Partial<Agent>> {
  const internalName = dto.internalName.trim();
  const clientId = dto.scope === 'exclusive' ? (dto.clientId ?? null) : null;
  const error = validateAgent(dto, {
    existing,
    duplicateName: await repo.internalNameTaken(internalName, existing?.id),
    clientExists: clientId !== null && !!(await repo.findCompany(clientId)),
  });
  if (error) throw new BadRequestException(error);

  const version = dto.version.trim();
  const description = dto.description.trim();
  const prompts = dto.prompts.map((s) => s.trim()).filter(Boolean).slice(0, 3);
  return {
    internalName,
    name: dto.name.trim(),
    short: dto.short.trim(),
    description,
    scope: dto.scope,
    clientId,
    status: dto.status,
    provider: 'Microsoft Foundry',
    endpoint: dto.endpoint.trim(),
    remoteId: dto.remoteId.trim(),
    auth: dto.auth,
    secretRef: dto.auth === 'vault' ? (dto.secretRef?.trim() ?? '') : '',
    version,
    owner: dto.owner.trim(),
    approved: dto.approved || null,
    manualUrl: dto.manualUrl?.trim() ?? '',
    manualVersion: dto.manualVersion?.trim() || version,
    tested: dto.tested,
    title: dto.title?.trim() || 'Como podemos apoiar sua comunicação?',
    intro: description,
    prompts: prompts.length ? prompts : ['Quero preparar uma comunicação'],
  };
}
