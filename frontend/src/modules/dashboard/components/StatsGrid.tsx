import type { AdminStatsDto } from '../dto/dashboard.dto';

export function StatsGrid({ stats }: { stats: AdminStatsDto }) {
  const items: [string, number, string][] = [
    ['Empresas', stats.companies, 'Ambientes separados'],
    ['Vagas contratadas', stats.licenses, 'Distribuídas por empresa'],
    ['Usuários ativos', stats.activeUsers, 'Contas individuais'],
    ['Assistentes no catálogo', stats.activeAgents, 'Agentes ativos'],
  ];
  return (
    <div className="stats" id="admin-stats">
      {items.map(([label, value, note]) => (
        <div className="stat" key={label}>
          <span className="label">{label}</span>
          <strong>{value}</strong>
          <small>{note}</small>
        </div>
      ))}
    </div>
  );
}
