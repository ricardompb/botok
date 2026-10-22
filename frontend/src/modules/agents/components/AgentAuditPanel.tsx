import type { AgentAuditDto } from '../dto/agent.dto';

export function AgentAuditPanel({ entries }: { entries: AgentAuditDto[] }) {
  return (
    <div className="panel">
      <h2>Registro de alterações</h2>
      <p className="small muted">Eventos fictícios desta demonstração, sem valores de credenciais e sem conversas.</p>
      <div id="agent-audit">
        {entries.length ? (
          entries.map((e, i) => (
            <div className="list-row" key={i}>
              <span>
                {e.action}
                <small>{e.author}</small>
              </span>
              <span className="small muted">{new Date(e.at).toLocaleString('pt-BR')}</span>
            </div>
          ))
        ) : (
          <p className="small muted" style={{ margin: 0 }}>
            Nenhuma alteração realizada nesta abertura do protótipo.
          </p>
        )}
      </div>
    </div>
  );
}
