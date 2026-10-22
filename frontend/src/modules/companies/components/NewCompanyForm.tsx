import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { apiErrorMessage } from '../../../shared/api/api-error';
import { useModal } from '../../../shared/hooks/use-modal';
import { useToast } from '../../../shared/hooks/use-toast';
import { companiesService } from '../services/companies.service';

export function NewCompanyForm() {
  const [name, setName] = useState('');
  const [seats, setSeats] = useState('3');
  const [error, setError] = useState('');
  const { close, dismiss } = useModal();
  const toast = useToast();
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    const licenses = Number(seats);
    if (!trimmed || licenses < 1 || licenses > 1000 || !Number.isInteger(licenses)) return;
    try {
      const { id } = await companiesService.create({ name: trimmed, licenses });
      close();
      navigate(paths.company(id));
      toast('Empresa fictícia criada. Configure os assistentes.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível criar a empresa.'));
    }
  }

  return (
    <>
      <p>Cadastro ilustrativo. Nenhum contrato ou cobrança será criado.</p>
      <form id="company-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="new-company">Nome da empresa</label>
          <input id="new-company" maxLength={70} required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="new-seats">Vagas contratadas</label>
          <input
            type="number"
            id="new-seats"
            min={1}
            max={1000}
            required
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
          />
        </div>
        <p className="small">Vigência fictícia: 31/10/2027. Configure os assistentes após cadastrar.</p>
        {error && <p className="error">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={dismiss}>
            Cancelar
          </button>
          <button type="submit" className="button">
            Criar empresa
          </button>
        </div>
      </form>
    </>
  );
}
