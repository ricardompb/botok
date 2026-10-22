import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../../shared/api/api-error';
import { useModal } from '../../../shared/hooks/use-modal';
import { useToast } from '../../../shared/hooks/use-toast';
import { usersService } from '../services/users.service';

interface Props {
  companyId: number;
  onAdded: () => void;
}

export function AddUserForm({ companyId, onAdded }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { close, dismiss } = useModal();
  const toast = useToast();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await usersService.create(companyId, { name: name.trim(), email: email.trim() });
      close();
      onAdded();
      toast('Usuário adicionado. Nenhum convite foi enviado.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível adicionar o usuário.'));
    }
  }

  return (
    <>
      <p>Utilize dados fictícios. Nenhum convite será enviado.</p>
      <form id="user-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="new-name">Nome</label>
          <input id="new-name" maxLength={70} required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="new-email">E-mail</label>
          <input
            id="new-email"
            type="email"
            maxLength={120}
            placeholder="nome@empresa.example"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <p className="error" id="user-error">
          {error}
        </p>
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={dismiss}>
            Cancelar
          </button>
          <button className="button" type="submit">
            Adicionar usuário
          </button>
        </div>
      </form>
    </>
  );
}
