import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../../shared/api/api-error';
import { useModal } from '../../../shared/hooks/use-modal';
import { useToast } from '../../../shared/hooks/use-toast';
import type { CompanyListItemDto } from '../../companies/dto/company.dto';
import { validateAgent, validateConnection } from '../agent-validation';
import type { AgentAdminDto, AgentAuth, AgentScope, AgentStatus, SaveAgentDto } from '../dto/agent.dto';
import { agentsService } from '../services/agents.service';

type FormState = Omit<SaveAgentDto, 'prompts' | 'tested'> & { prompts: string };

const CONNECTION_FIELDS: (keyof FormState)[] = ['endpoint', 'remoteId', 'auth', 'secretRef'];

function initialState(agent: AgentAdminDto | null, companies: CompanyListItemDto[]): FormState {
  return {
    internalName: agent?.internalName ?? '',
    name: agent?.name ?? '',
    short: agent?.short ?? '',
    status: agent?.status ?? 'draft',
    description: agent?.description ?? '',
    scope: agent?.scope ?? 'generic',
    clientId: agent?.clientId ?? companies[0]?.id ?? null,
    version: agent?.version ?? '1.0',
    owner: agent?.owner ?? 'IT’s OK',
    approved: agent?.approved ?? '',
    title: agent?.title ?? '',
    prompts: (agent?.prompts ?? []).join('\n'),
    endpoint: agent?.endpoint ?? 'https://foundry.example/projects/itsok',
    remoteId: agent?.remoteId ?? '',
    auth: agent?.auth ?? 'entra',
    secretRef: agent?.secretRef ?? '',
    manualUrl: agent?.manualUrl ?? '',
    manualVersion: agent?.manualVersion ?? '1.0',
  };
}

interface Props {
  agent: AgentAdminDto | null;
  agents: AgentAdminDto[];
  companies: CompanyListItemDto[];
  onSaved: () => void;
}

export function AgentForm({ agent, agents, companies, onSaved }: Props) {
  const [form, setForm] = useState(() => initialState(agent, companies));
  const [tested, setTested] = useState(!!agent?.tested);
  const [testResult, setTestResult] = useState(
    agent?.tested ? 'Configuração com teste simulado anterior.' : 'Teste ainda não realizado.',
  );
  const [error, setError] = useState('');
  const { close, dismiss } = useModal();
  const toast = useToast();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (CONNECTION_FIELDS.includes(key)) {
      setTested(false);
      setTestResult('Conexão alterada. Repita o teste simulado.');
    }
  };

  const toDto = (): SaveAgentDto => {
    const version = form.version.trim();
    return {
      ...form,
      clientId: form.scope === 'exclusive' ? form.clientId : null,
      prompts: form.prompts
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3),
      secretRef: form.auth === 'vault' ? form.secretRef : '',
      manualVersion: form.manualVersion.trim() || version,
      tested,
    };
  };

  const testConnection = () => {
    const message = validateConnection(toDto());
    setError(message);
    if (message) return;
    setTested(true);
    setTestResult('Teste simulado aprovado — nenhuma chamada externa.');
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const dto = toDto();
    const message = validateAgent(dto, { existing: agent, agents, companyIds: companies.map((c) => c.id) });
    if (message) {
      setError(message);
      return;
    }
    try {
      if (agent) await agentsService.update(agent.id, dto);
      else await agentsService.create(dto);
      close();
      onSaved();
      toast('Cadastro salvo. Autorize o uso em Empresas e licenças.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível salvar o agente.'));
    }
  }

  const field = (id: string, label: string, key: keyof FormState, required = false, type = 'text') => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={String(form[key] ?? '')}
        required={required}
        maxLength={type === 'url' ? 500 : 160}
        onChange={(e) => set(key, e.target.value as never)}
      />
    </div>
  );

  return (
    <>
      <p>Cadastro no portal. Instruções e conhecimento são mantidos no Foundry.</p>
      <form id="agent-form" onSubmit={submit}>
        <div className="two-col">
          {field('ag-internal', 'Nome interno', 'internalName', true)}
          {field('ag-name', 'Nome apresentado ao usuário', 'name', true)}
        </div>
        <div className="two-col">
          {field('ag-short', 'Nome curto', 'short', true)}
          <div className="field">
            <label htmlFor="ag-status">Situação</label>
            <select id="ag-status" value={form.status} onChange={(e) => set('status', e.target.value as AgentStatus)}>
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="ag-desc">Descrição</label>
          <textarea
            id="ag-desc"
            rows={2}
            maxLength={400}
            required
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
        <div className="two-col">
          <div className="field">
            <label htmlFor="ag-scope">Destinação</label>
            <select id="ag-scope" value={form.scope} onChange={(e) => set('scope', e.target.value as AgentScope)}>
              <option value="generic">Genérico</option>
              <option value="exclusive">Exclusivo de um cliente</option>
            </select>
          </div>
          <div className="field" id="ag-client-field" hidden={form.scope !== 'exclusive'}>
            <label htmlFor="ag-client">Empresa destinatária</label>
            <select
              id="ag-client"
              value={String(form.clientId ?? '')}
              onChange={(e) => set('clientId', Number(e.target.value))}
            >
              {companies.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="two-col">
          {field('ag-version', 'Versão da configuração', 'version', true)}
          {field('ag-owner', 'Responsável pela configuração', 'owner', true)}
          {field('ag-approved', 'Data de aprovação', 'approved', false, 'date')}
        </div>
        <details className="agent-details" open>
          <summary>Apresentação da conversa</summary>
          {field('ag-title', 'Título de abertura', 'title')}
          <div className="field">
            <label htmlFor="ag-prompts">Sugestões iniciais — uma por linha, até três</label>
            <textarea
              id="ag-prompts"
              rows={3}
              maxLength={500}
              value={form.prompts}
              onChange={(e) => set('prompts', e.target.value)}
            />
          </div>
        </details>
        <details className="agent-details" open>
          <summary>Conexão com o agente</summary>
          <p className="small muted">
            Somente exemplos fictícios. O teste abaixo não chama o Foundry. Os campos definitivos dependerão da
            integração contratada.
          </p>
          <div className="field">
            <label htmlFor="ag-provider">Provedor</label>
            <input id="ag-provider" value="Microsoft Foundry" readOnly />
          </div>
          {field('ag-endpoint', 'Endpoint HTTPS — não incluir tokens na URL', 'endpoint', false, 'url')}
          {field('ag-remote', 'Identificador do agente ou publicação', 'remoteId')}
          <div className="field">
            <label htmlFor="ag-auth">Método de autenticação</label>
            <select id="ag-auth" value={form.auth} onChange={(e) => set('auth', e.target.value as AgentAuth)}>
              <option value="entra">Microsoft Entra ID — identidade do backend</option>
              <option value="vault">Credencial em cofre — se suportado pela integração</option>
            </select>
          </div>
          <div id="ag-secret-field" hidden={form.auth !== 'vault'}>
            {field('ag-secret', 'Referência fictícia do segredo no cofre — nunca a chave', 'secretRef')}
          </div>
          <div className="notice">
            Nenhum campo recebe o valor de uma chave. Na implementação real, o backend obterá a credencial no
            armazenamento protegido, quando aplicável.
          </div>
          <div className="row wrap" style={{ marginTop: 16 }}>
            <button type="button" className="button secondary small" id="test-agent" onClick={testConnection}>
              Simular teste de conexão
            </button>
            <span className="small muted" id="ag-test-result">
              {testResult}
            </span>
          </div>
        </details>
        <details className="agent-details">
          <summary>Manual de Bordo</summary>
          {field('ag-manual', 'Endereço HTTPS do manual aprovado', 'manualUrl', false, 'url')}
          {field('ag-manual-version', 'Versão do manual', 'manualVersion')}
          <p className="small muted">
            Campo vazio representa um manual ainda a vincular. Arquivos exclusivos devem ter autorização compatível
            com a empresa; o endereço não substitui a proteção de acesso.
          </p>
        </details>
        <p className="error" id="ag-error" role="alert">
          {error}
        </p>
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={dismiss}>
            Cancelar
          </button>
          <button className="button" type="submit">
            Salvar agente
          </button>
        </div>
      </form>
    </>
  );
}
