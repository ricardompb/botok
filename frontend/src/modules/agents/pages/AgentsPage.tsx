import { Navigate, useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { apiErrorStatus } from '../../../shared/api/api-error';
import { Icon } from '../../../shared/components/Icon';
import { useDocumentTitle } from '../../../shared/hooks/use-document-title';
import { useModal } from '../../../shared/hooks/use-modal';
import { useToast } from '../../../shared/hooks/use-toast';
import { useCompanies } from '../../companies/hooks/use-companies';
import { AgentAuditPanel } from '../components/AgentAuditPanel';
import { AgentForm } from '../components/AgentForm';
import { AgentRegistryTable, type AgentAction } from '../components/AgentRegistryTable';
import type { AgentAdminDto } from '../dto/agent.dto';
import { useAgentConsole } from '../hooks/use-agent-console';
import { useAgents } from '../hooks/use-agents';
import { agentsService } from '../services/agents.service';

const ACTION_LABEL: Record<AgentAction, string> = { suspend: 'Suspender', archive: 'Arquivar', delete: 'Excluir' };

/** Acesso direto pela URL também exige a verificação adicional. */
export function AgentsRoute() {
  const { verified } = useAgentConsole();
  if (!verified) return <Navigate to={paths.admin} replace state={{ agentGate: true }} />;
  return <AgentsPage />;
}

export function AgentsPage() {
  useDocumentTitle('Catálogo de agentes');
  const { agents, audit, reload } = useAgents();
  const { companies } = useCompanies();
  const { open, close, dismiss, info } = useModal();
  const toast = useToast();
  const navigate = useNavigate();
  if (!agents || !audit || !companies) return null;

  const edit = (agent: AgentAdminDto | null) =>
    open({
      title: agent ? 'Editar agente' : 'Novo agente',
      body: <AgentForm agent={agent} agents={agents} companies={companies} onSaved={reload} />,
      wide: true,
    });

  const apply = async (agent: AgentAdminDto, action: AgentAction) => {
    try {
      if (action === 'delete') await agentsService.remove(agent.id);
      else await agentsService.changeStatus(agent.id, action === 'suspend' ? 'suspended' : 'archived');
      close();
      reload();
      toast('Alteração aplicada somente na demonstração.');
    } catch (err) {
      close();
      reload();
      toast(apiErrorStatus(err) === 409 ? 'Exclusão bloqueada por vínculo de licença.' : 'Não foi possível aplicar a alteração.');
    }
  };

  const requestAction = (agent: AgentAdminDto, action: AgentAction) => {
    if (action === 'delete' && agent.linkedCompanies) {
      info(
        'Agente vinculado a empresas',
        <>
          <p>
            Este cadastro possui {agent.linkedCompanies} vínculo(s) de licença. Remova os vínculos ou arquive o agente
            para impedir novos usos.
          </p>
          <p>Em produção, registros de uso também deverão ser considerados antes de permitir uma exclusão definitiva.</p>
        </>,
      );
      return;
    }
    const label = ACTION_LABEL[action];
    open({
      title: label + ' agente?',
      body: (
        <>
          <p>{agent.internalName}</p>
          <p>
            {action === 'delete'
              ? 'O cadastro será removido desta demonstração. Nenhum recurso será excluído no Foundry.'
              : 'O agente deixará de aparecer entre os disponíveis. Os vínculos de licença serão preservados para administração.'}
          </p>
        </>
      ),
      actions: (
        <>
          <button className="button secondary" onClick={dismiss}>
            Cancelar
          </button>
          <button className="button" data-confirm-agent={agent.id} onClick={() => apply(agent, action)}>
            {label}
          </button>
        </>
      ),
    });
  };

  const lockConsole = () => {
    // Sair da tela de agentes bloqueia o console (ver RootLayout).
    navigate(paths.admin);
    toast('Console bloqueado.');
  };

  return (
    <section id="view-agents" className="view">
      <div className="page">
        <button className="text-link small" data-page="admin" onClick={() => navigate(paths.admin)}>
          ← Administração IT’s OK
        </button>
        <div className="page-title" style={{ marginTop: 24 }}>
          <div>
            <span className="eyebrow">Administração restrita</span>
            <h1>Catálogo de agentes</h1>
            <p>Inclua especialidades, configure conexões e organize versões por cliente.</p>
          </div>
          <button className="button" id="new-agent" onClick={() => edit(null)}>
            + Novo agente
          </button>
        </div>
        <div className="row between wrap" style={{ marginBottom: 20 }}>
          <span className="pill">
            <span className="dot" /> Verificação adicional simulada
          </span>
          <button className="text-link small" id="lock-agents" onClick={lockConsole}>
            Bloquear console
          </button>
        </div>
        <div className="notice">
          <Icon name="shield" />
          <p>
            Esta área representa um acesso restrito. Use apenas dados fictícios. A autenticação e os testes de conexão
            são simulados; nenhum segredo real deve ser informado neste HTML.
          </p>
        </div>
        <AgentRegistryTable agents={agents} onEdit={edit} onAction={requestAction} />
        <div className="two-col">
          <div className="panel">
            <h2>Metodologia e execução</h2>
            <p className="small muted">
              Instruções, base de conhecimento e comportamento continuam sendo mantidos no Foundry pela IT’s OK. Aqui
              são administrados o catálogo, a conexão e a disponibilização no portal.
            </p>
            <p className="small muted" style={{ margin: 0 }}>
              Novos agentes compatíveis com a integração podem ser cadastrados sem alteração no código.
            </p>
          </div>
          <div className="panel">
            <h2>Exclusividade por cliente</h2>
            <p className="small muted">
              Um agente personalizado fica restrito à empresa destinatária. A contratação e as permissões de uso
              continuam sendo configuradas em “Empresas e licenças”.
            </p>
            <p className="small muted" style={{ margin: 0 }}>
              Arquivar ou excluir um cadastro no portal não exclui o agente hospedado no Foundry.
            </p>
          </div>
        </div>
        <AgentAuditPanel entries={audit} />
      </div>
    </section>
  );
}
