import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../../shared/api/api-error';
import { useToast } from '../../../shared/hooks/use-toast';
import type { CompanyDetailDto } from '../dto/company.dto';
import { companiesService } from '../services/companies.service';

interface Props {
  company: CompanyDetailDto;
  onSaved: () => void;
}

export function EntitlementsPanel({ company, onSaved }: Props) {
  const [selected, setSelected] = useState(() => new Set(company.allowedAgentIds));
  const toast = useToast();

  const toggle = (id: string, checked: boolean) =>
    setSelected((s) => {
      const next = new Set(s);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const agentIds = company.entitlementOptions.map((o) => o.id).filter((id) => selected.has(id));
    try {
      await companiesService.updateEntitlements(company.id, agentIds);
      toast('Permissões atualizadas na demonstração.');
      onSaved();
    } catch (err) {
      toast(apiErrorMessage(err, 'Não foi possível salvar as permissões.'));
    }
  }

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <h2>Assistentes contratados</h2>
      <p className="small muted">As permissões definem o que os usuários desta empresa podem acessar.</p>
      <form id="entitlements-form" onSubmit={submit}>
        <div id="entitlements">
          {company.entitlementOptions.map((o) => (
            <label className="checkbox-label" key={o.id}>
              <input
                type="checkbox"
                name="agent"
                value={o.id}
                checked={selected.has(o.id)}
                onChange={(e) => toggle(o.id, e.target.checked)}
              />
              {o.name}
            </label>
          ))}
        </div>
        <button className="button small" type="submit" style={{ marginTop: 15 }}>
          Salvar permissões
        </button>
      </form>
    </div>
  );
}
