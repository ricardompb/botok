import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { Icon } from '../../../shared/components/Icon';
import { useDocumentTitle } from '../../../shared/hooks/use-document-title';
import { useModal } from '../../../shared/hooks/use-modal';
import { useAgentConsole } from '../../agents/hooks/use-agent-console';
import { PrivacyPanel } from '../../dashboard/components/PrivacyPanel';
import { StatsGrid } from '../../dashboard/components/StatsGrid';
import { UsagePanel } from '../../dashboard/components/UsagePanel';
import { useDashboard } from '../../dashboard/hooks/use-dashboard';
import { CompaniesTable } from '../components/CompaniesTable';
import { NewCompanyForm } from '../components/NewCompanyForm';
import { useCompanies } from '../hooks/use-companies';

/** Administração IT’s OK · Empresas e licenças. */
export function CompaniesPage() {
  useDocumentTitle('Empresas e licenças');
  const { stats, usage } = useDashboard();
  const { companies } = useCompanies();
  const { open } = useModal();
  const { openConsole } = useAgentConsole();
  const navigate = useNavigate();
  const location = useLocation();

  // Acesso direto ao console sem verificação: abre a verificação aqui.
  useEffect(() => {
    if ((location.state as { agentGate?: boolean } | null)?.agentGate) {
      navigate(location.pathname, { replace: true, state: null });
      openConsole();
    }
  }, [location, navigate, openConsole]);

  if (!stats || !usage || !companies) return null;

  return (
    <section id="view-admin" className="view">
      <div className="page">
        <div className="page-title">
          <div>
            <span className="eyebrow">Administração IT’s OK</span>
            <h1>Empresas e licenças</h1>
            <p>Um lugar para organizar acessos, assistentes e consumo.</p>
          </div>
          <div className="row wrap">
            <button className="button secondary" data-page="agents" onClick={openConsole}>
              <Icon name="shield" /> Gerenciar agentes
            </button>
            <button
              className="button"
              id="add-company"
              onClick={() => open({ title: 'Nova empresa', body: <NewCompanyForm /> })}
            >
              + Nova empresa
            </button>
          </div>
        </div>
        <StatsGrid stats={stats} />
        <CompaniesTable companies={companies} onManage={(id) => navigate(paths.company(id))} />
        <div className="admin-columns">
          <UsagePanel usage={usage} />
          <PrivacyPanel />
        </div>
      </div>
    </section>
  );
}
