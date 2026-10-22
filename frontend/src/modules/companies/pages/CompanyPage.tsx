import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { useDocumentTitle } from '../../../shared/hooks/use-document-title';
import { UsersPanel } from '../../users/components/UsersPanel';
import { useUsers } from '../../users/hooks/use-users';
import { CompanyFactsPanel } from '../components/CompanyFactsPanel';
import { EntitlementsPanel } from '../components/EntitlementsPanel';
import { useCompany } from '../hooks/use-companies';

/** Ambiente da empresa: permissões, licença e usuários. */
export function CompanyPage() {
  useDocumentTitle('Empresa');
  const companyId = Number(useParams().companyId);
  const { company, error, reload } = useCompany(companyId);
  const { users, reload: reloadUsers } = useUsers(companyId);
  const navigate = useNavigate();

  if (error) return <Navigate to={paths.admin} replace />;
  if (!company || !users) return null;

  return (
    <section id="view-company" className="view">
      <div className="page">
        <button className="text-link small" data-page="admin" onClick={() => navigate(paths.admin)}>
          ← Empresas e licenças
        </button>
        <div className="page-title" style={{ marginTop: 24 }}>
          <div>
            <span className="eyebrow">Ambiente da empresa</span>
            <h1 id="company-title">{company.name}</h1>
            <p>Usuários, permissões e condições de acesso.</p>
          </div>
          <span className="pill">Contrato demonstrativo</span>
        </div>
        <div className="two-col">
          <EntitlementsPanel key={company.id} company={company} onSaved={reload} />
          <CompanyFactsPanel company={company} />
        </div>
        <UsersPanel
          companyId={company.id}
          licenses={company.licenses}
          users={users}
          onChanged={() => {
            reloadUsers();
            reload();
          }}
        />
      </div>
    </section>
  );
}
