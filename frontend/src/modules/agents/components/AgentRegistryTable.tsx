import type { AgentAdminDto, AgentStatus } from '../dto/agent.dto';

export type AgentAction = 'suspend' | 'archive' | 'delete';

const STATUS_LABEL: Record<AgentStatus, string> = {
  active: 'Ativo',
  draft: 'Rascunho',
  suspended: 'Suspenso',
  archived: 'Arquivado',
};

interface Props {
  agents: AgentAdminDto[];
  onEdit: (agent: AgentAdminDto) => void;
  onAction: (agent: AgentAdminDto, action: AgentAction) => void;
}

export function AgentRegistryTable({ agents, onEdit, onAction }: Props) {
  const activeCount = agents.filter((a) => a.status === 'active').length;
  return (
    <div className="panel">
      <div className="row between wrap">
        <h2 style={{ margin: 0 }}>Agentes cadastrados</h2>
        <span className="small muted" id="registry-count">
          {agents.length} agentes · {activeCount} ativos
        </span>
      </div>
      <div className="table-wrap">
        <table style={{ minWidth: 950 }}>
          <thead>
            <tr>
              <th>Agente e versão</th>
              <th>Destinação</th>
              <th>Situação</th>
              <th>Conexão</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="agent-registry">
            {agents.map((a) => (
              <tr key={a.id}>
                <td>
                  <b className="company-name">{a.internalName}</b>
                  <br />
                  <span className="small muted">
                    {a.short} · v{a.version}
                  </span>
                </td>
                <td>{a.scope === 'generic' ? 'Genérico' : (a.clientName ?? 'Cliente não definido')}</td>
                <td>
                  <span className={'pill ' + (a.status === 'active' ? '' : a.status === 'draft' ? 'amber' : 'gray')}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td>
                  <span className="small">{a.provider}</span>
                  <br />
                  <span className="small muted">{a.tested ? 'Teste simulado registrado' : 'Teste pendente'}</span>
                </td>
                <td>
                  <div className="row wrap">
                    <button className="button secondary small" data-edit-agent={a.id} onClick={() => onEdit(a)}>
                      Editar
                    </button>
                    {a.status === 'active' && (
                      <button className="button ghost small" onClick={() => onAction(a, 'suspend')}>
                        Suspender
                      </button>
                    )}
                    {a.status !== 'archived' && (
                      <button className="button ghost small" onClick={() => onAction(a, 'archive')}>
                        Arquivar
                      </button>
                    )}
                    <button className="button ghost small" onClick={() => onAction(a, 'delete')}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
