import { validateAgent } from './agent-validation.js';
import type { SaveAgentDto } from './dto/save-agent.dto.js';
import type { Agent } from './entities/agent.entity.js';

const base: SaveAgentDto = {
  internalName: 'Novo',
  name: 'Novo',
  short: 'N',
  status: 'draft',
  description: 'Descrição',
  scope: 'generic',
  version: '1.0',
  owner: 'IT’s OK',
  approved: '',
  prompts: [],
  endpoint: 'https://foundry.example/projects/itsok',
  remoteId: 'agent-x',
  auth: 'entra',
  tested: false,
};
const ctx = { existing: null, duplicateName: false, clientExists: false };

describe('validateAgent', () => {
  it('aceita rascunho válido', () => {
    expect(validateAgent(base, ctx)).toBe('');
  });

  it('exige campos obrigatórios', () => {
    expect(validateAgent({ ...base, owner: ' ' }, ctx)).toBe(
      'Preencha os campos obrigatórios com conteúdo válido.',
    );
  });

  it('exige empresa destinatária para agente exclusivo', () => {
    expect(validateAgent({ ...base, scope: 'exclusive' }, ctx)).toBe(
      'Selecione uma empresa destinatária.',
    );
  });

  it('ativação exige conexão segura, teste e aprovação, nessa ordem', () => {
    const active = { ...base, status: 'active' as const };
    expect(validateAgent({ ...active, endpoint: 'http://x' }, ctx)).toBe(
      'Informe um endpoint HTTPS e um identificador fictício de agente.',
    );
    expect(validateAgent({ ...active, endpoint: 'https://x.example/?token=1' }, ctx)).toBe(
      'Use uma URL sem parâmetros ou fragmentos; não inclua credenciais no endereço.',
    );
    expect(validateAgent(active, ctx)).toBe('Realize o teste simulado antes de ativar o agente.');
    expect(validateAgent({ ...active, tested: true }, ctx)).toBe(
      'Informe a data de aprovação antes da ativação.',
    );
    expect(validateAgent({ ...active, tested: true, approved: '2026-10-20' }, ctx)).toBe('');
  });

  it('exige nova versão ao alterar a conexão', () => {
    const existing = { ...base, secretRef: '' } as unknown as Agent;
    expect(
      validateAgent({ ...base, remoteId: 'outro' }, { ...ctx, existing }),
    ).toBe('Atualize a versão ao modificar a configuração de conexão.');
    expect(
      validateAgent({ ...base, remoteId: 'outro', version: '1.1' }, { ...ctx, existing }),
    ).toBe('');
  });
});
