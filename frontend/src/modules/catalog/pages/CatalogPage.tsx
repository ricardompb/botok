import { useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { useDocumentTitle } from '../../../shared/hooks/use-document-title';
import { useModal } from '../../../shared/hooks/use-modal';
import { firstName } from '../../../shared/utils/format';
import { useAuth } from '../../auth/hooks/use-auth';
import { AgentCard } from '../components/AgentCard';
import { LockedAgentCard } from '../components/LockedAgentCard';
import { SessionInfo } from '../components/SessionInfo';
import { WelcomeBanner } from '../components/WelcomeBanner';
import type { AgentSummaryDto } from '../dto/catalog.dto';
import { useCatalog } from '../hooks/use-catalog';

export function CatalogPage() {
  useDocumentTitle('Seus assistentes');
  const { user } = useAuth();
  const { catalog } = useCatalog();
  const { info } = useModal();
  const navigate = useNavigate();
  if (!catalog || !user) return null;

  const { available, others } = catalog;
  const about = (agent: AgentSummaryDto) =>
    info(
      agent.name,
      <>
        <p>{agent.description}</p>
        <p>
          Este assistente não está incluído no acesso atual. A contratação é tratada entre sua empresa e a
          IT’s OK, fora da plataforma.
        </p>
      </>,
    );

  return (
    <section id="view-catalog" className="view">
      <div className="page">
        <div className="row between" style={{ marginBottom: 23 }}>
          <span className="eyebrow">Seu espaço IT’s OK</span>
          <span className="pill">
            <span className="dot" /> Acesso ativo
          </span>
        </div>
        <WelcomeBanner firstName={firstName(user.name)} />
        <div className="row between section-title">
          <h2>Seus assistentes</h2>
          <span className="small muted" id="available-count">
            {available.length} disponíveis
          </span>
        </div>
        <div className="agent-grid" id="agent-cards">
          {available.length ? (
            available.map((a, i) => (
              <AgentCard key={a.id} agent={a} featured={i === 0} onStart={(id) => navigate(paths.chat(id))} />
            ))
          ) : (
            <div className="notice">
              Nenhum assistente está liberado para esta empresa. Entre em contato com a IT’s OK.
            </div>
          )}
        </div>
        <div id="other-section" hidden={!others.length}>
          <div className="row between section-title">
            <h2>Outras especialidades</h2>
            <span className="small muted">Conheça o que mais podemos fazer</span>
          </div>
          <div className="other-grid" id="other-cards">
            {others.map((a) => (
              <LockedAgentCard key={a.id} agent={a} onAbout={about} />
            ))}
          </div>
        </div>
        <SessionInfo />
      </div>
    </section>
  );
}
