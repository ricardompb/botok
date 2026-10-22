import type { AgentUsageDto } from '../dto/dashboard.dto';

export function UsagePanel({ usage }: { usage: AgentUsageDto[] }) {
  return (
    <div className="panel">
      <h2>Utilização por assistente</h2>
      <p className="muted small">Sessões iniciadas neste mês · valores ilustrativos</p>
      {usage.map((u) => (
        <div className="list-row" key={u.agentId}>
          <span>{u.name}</span>
          <strong>{u.sessions}</strong>
        </div>
      ))}
    </div>
  );
}
