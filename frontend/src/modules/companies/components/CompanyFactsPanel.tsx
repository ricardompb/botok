import { Icon } from '../../../shared/components/Icon';
import { formatDate } from '../../../shared/utils/format';
import type { CompanyDetailDto } from '../dto/company.dto';

export function CompanyFactsPanel({ company }: { company: CompanyDetailDto }) {
  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <h2>Licença e consumo</h2>
      <div id="company-facts">
        <div className="list-row">
          <span>Vigência até</span>
          <b>{formatDate(company.until)}</b>
        </div>
        <div className="list-row">
          <span>Vagas ocupadas</span>
          <b>
            {company.activeUsers} de {company.licenses}
          </b>
        </div>
        <div className="list-row">
          <span>Franquia utilizada no período</span>
          <b>{company.quota}%</b>
        </div>
      </div>
      <div className="notice" style={{ marginTop: 20 }}>
        <Icon name="info" />
        <p>A franquia é demonstrativa. A unidade de consumo e a política de bloqueio serão definidas no projeto.</p>
      </div>
    </div>
  );
}
