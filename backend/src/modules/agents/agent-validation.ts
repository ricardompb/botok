import { isSafeHttps } from '../../common/utils/safe-https.js';
import type { SaveAgentDto } from './dto/save-agent.dto.js';
import type { Agent } from './entities/agent.entity.js';

export function validateConnection(dto: SaveAgentDto): string {
  const endpoint = dto.endpoint.trim();
  if (!isSafeHttps(endpoint) || !dto.remoteId.trim()) {
    return 'Informe um endpoint HTTPS e um identificador fictício de agente.';
  }
  const url = new URL(endpoint);
  if (url.search || url.hash) {
    return 'Use uma URL sem parâmetros ou fragmentos; não inclua credenciais no endereço.';
  }
  if (dto.auth === 'vault' && !dto.secretRef?.trim()) {
    return 'Informe somente a referência fictícia do segredo, nunca a chave.';
  }
  return '';
}

/** Regras do cadastro de agentes, na mesma ordem de prioridade do protótipo. */
export function validateAgent(
  dto: SaveAgentDto,
  ctx: { existing: Agent | null; duplicateName: boolean; clientExists: boolean },
): string {
  let error = '';
  const required = [
    dto.name,
    dto.short,
    dto.internalName,
    dto.description,
    dto.version,
    dto.owner,
  ];
  if (required.some((v) => !v?.trim())) {
    error = 'Preencha os campos obrigatórios com conteúdo válido.';
  }
  if (dto.scope === 'exclusive' && !ctx.clientExists) {
    error = 'Selecione uma empresa destinatária.';
  }
  if (ctx.duplicateName) error = 'Já existe um agente com este nome interno.';
  if (dto.status === 'active') {
    error ||= validateConnection(dto);
    if (!dto.tested) error ||= 'Realize o teste simulado antes de ativar o agente.';
    if (!dto.approved) error ||= 'Informe a data de aprovação antes da ativação.';
  }
  const manual = dto.manualUrl?.trim();
  if (manual && !isSafeHttps(manual)) {
    error ||= 'O endereço do manual deve usar HTTPS, sem credenciais na URL.';
  }
  if (error) return error;

  const old = ctx.existing;
  const changedConnection =
    old &&
    (old.endpoint !== dto.endpoint.trim() ||
      old.remoteId !== dto.remoteId.trim() ||
      old.auth !== dto.auth ||
      old.secretRef !== (dto.secretRef?.trim() ?? ''));
  if (old && changedConnection && dto.version.trim() === old.version) {
    return 'Atualize a versão ao modificar a configuração de conexão.';
  }
  return '';
}
