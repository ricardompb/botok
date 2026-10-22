import { formatDate } from '../../../shared/utils/format';
import type { CompanyListItemDto } from '../dto/company.dto';

interface Props {
  companies: CompanyListItemDto[];
  onManage: (id: number) => void;
}

export function CompaniesTable({ companies, onManage }: Props) {
  return (
    <div className="panel">
      <div className="row between wrap">
        <h2 style={{ margin: 0 }}>Empresas cadastradas</h2>
        <span className="pill gray">Cenário ilustrativo de operação inicial</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Assistentes</th>
              <th>Licenças</th>
              <th>Franquia utilizada</th>
              <th>Vigência</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="companies">
            {companies.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className="company-name">{c.name}</span>
                </td>
                <td>{c.agents.join(' · ')}</td>
                <td>
                  {c.activeUsers} / {c.licenses}
                </td>
                <td>
                  {c.quota}%
                  <div className="meter">
                    <i style={{ width: c.quota + '%' }} />
                  </div>
                </td>
                <td>{formatDate(c.until)}</td>
                <td>
                  <button className="button secondary small" data-company={c.id} onClick={() => onManage(c.id)}>
                    Gerenciar →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
